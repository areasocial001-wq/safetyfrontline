/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Conferma la tua email per SicurAzienda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🛡️ Conferma la tua email</Heading>
        <Text style={text}>
          Benvenuto su{' '}
          <Link href={siteUrl} style={link}>
            <strong>SicurAzienda</strong>
          </Link>
          ! Siamo entusiasti di averti a bordo nella formazione sicurezza gamificata.
        </Text>
        <Text style={text}>
          Conferma il tuo indirizzo email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) cliccando il pulsante qui sotto:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Conferma Email
        </Button>
        <Text style={footer}>
          Se non hai creato un account, puoi ignorare questa email in tutta sicurezza.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1f242e',
  margin: '0 0 24px',
}
const text = {
  fontSize: '15px',
  color: '#6a7280',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: '#ff6933', textDecoration: 'underline' }
const button = {
  backgroundColor: '#ff6933',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', lineHeight: '1.5' }
