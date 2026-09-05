import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { to, subject, htmlContent } = await req.json()

  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'to is not valid' }, { status: 400 })
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: 'Sua Empresa', email: 'calmaraapp@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    return NextResponse.json({ error }, { status: response.status })
  }

  return NextResponse.json(await response.json())
}
