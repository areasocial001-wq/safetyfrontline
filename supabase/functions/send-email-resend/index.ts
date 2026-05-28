// Edge function: invio email transazionali tramite Resend HTTP API.
// Richiede secret: RESEND_API_KEY
// Dominio mittente: deve essere verificato su https://resend.com/domains
// Usa un sottodominio DIVERSO da notify.sicurazienda.com (es. mail.sicurazienda.com)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const FROM_DEFAULT = 'SicurAzienda <noreply@mail.sicurazienda.com>'

interface SendEmailBody {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY non configurata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  let body: SendEmailBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'JSON non valido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const recipients = Array.isArray(body.to) ? body.to : [body.to]
  if (!recipients.length || !recipients.every((e) => typeof e === 'string' && isValidEmail(e))) {
    return new Response(JSON.stringify({ error: 'Destinatari non validi' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!body.subject || typeof body.subject !== 'string' || body.subject.length > 200) {
    return new Response(JSON.stringify({ error: 'Subject mancante o troppo lungo' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!body.html && !body.text) {
    return new Response(JSON.stringify({ error: 'Body html o text richiesto' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const payload: Record<string, unknown> = {
    from: body.from || FROM_DEFAULT,
    to: recipients,
    subject: body.subject,
  }
  if (body.html) payload.html = body.html
  if (body.text) payload.text = body.text
  if (body.replyTo) payload.reply_to = body.replyTo

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Resend send error', { status: res.status, data })
    return new Response(
      JSON.stringify({ error: 'Invio fallito', status: res.status, details: data }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify({ success: true, id: data?.id ?? null }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
