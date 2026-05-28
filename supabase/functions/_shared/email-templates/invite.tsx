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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Sei stato invitato in SicurAzienda</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Sei stato invitato</Heading>
        <Text style={text}>
          Sei stato invitato a unirti a{' '}
          <Link href={siteUrl} style={link}>
            <strong>SicurAzienda</strong>
          </Link>
          , la piattaforma di formazione gamificata sulla sicurezza sul lavoro.
          Clicca il pulsante qui sotto per accettare e creare il tuo account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accetta invito
        </Button>
        <Text style={footer}>
          Se non ti aspettavi questo invito, puoi ignorare questa email in tutta sicurezza.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
