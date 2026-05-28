/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Reimposta la tua password SicurAzienda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔑 Reimposta la tua password</Heading>
        <Text style={text}>
          Abbiamo ricevuto una richiesta di reimpostazione password per il tuo account SicurAzienda.
          Clicca il pulsante qui sotto per scegliere una nuova password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reimposta Password
        </Button>
        <Text style={footer}>
          Se non hai richiesto questa modifica, puoi ignorare questa email. La tua password resterà invariata.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1f242e', margin: '0 0 24px' }
const text = { fontSize: '15px', color: '#6a7280', lineHeight: '1.6', margin: '0 0 20px' }
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
