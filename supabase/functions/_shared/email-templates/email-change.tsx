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

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Conferma la modifica della tua email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✉️ Conferma il cambio email</Heading>
        <Text style={text}>
          Hai richiesto di cambiare l'indirizzo email del tuo account SicurAzienda da{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}
          a{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Text style={text}>Clicca il pulsante qui sotto per confermare:</Text>
        <Button style={button} href={confirmationUrl}>
          Conferma cambio email
        </Button>
        <Text style={footer}>
          Se non hai richiesto questa modifica, ti consigliamo di proteggere immediatamente il tuo account.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1f242e', margin: '0 0 24px' }
const text = { fontSize: '15px', color: '#6a7280', lineHeight: '1.6', margin: '0 0 20px' }
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
