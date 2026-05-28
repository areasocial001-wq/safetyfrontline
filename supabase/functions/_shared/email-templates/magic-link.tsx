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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo link di accesso a SicurAzienda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔐 Accedi a SicurAzienda</Heading>
        <Text style={text}>
          Clicca il pulsante qui sotto per accedere alla piattaforma. Il link scadrà a breve.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accedi ora
        </Button>
        <Text style={footer}>
          Se non hai richiesto questo link, puoi ignorare questa email in tutta sicurezza.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
