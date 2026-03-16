import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { texto, idioma } = await req.json()
    if (!texto) return NextResponse.json({ traduccion: '' })

    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [texto],
        target_lang: idioma || 'EN',
      }),
    })
    const data = await res.json()
    const traduccion = data.translations?.[0]?.text || texto
    return NextResponse.json({ traduccion })
  } catch (err) {
    return NextResponse.json({ traduccion: '' }, { status: 500 })
  }
}