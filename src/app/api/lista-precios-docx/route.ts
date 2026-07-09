import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
} from 'docx'

const NAVY = '0F2B5B'
const ORANGE = 'F47B20'
const GRAY = 'A0AEC0'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: productos, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('categoria')
      .order('nombre')
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const categorias = [...new Set((productos || []).map((p: any) => p.categoria))].sort()
    const fecha = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const cellBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'EDF2F7' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EDF2F7' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'EDF2F7' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'EDF2F7' },
    }

    function productCell(p: any) {
      return new TableCell({
        borders: cellBorders,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        width: { size: 33.33, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: p.nombre, size: 16, color: '1A202C' }),
              new TextRun({ text: `   ${p.unidad || ''}   `, size: 14, color: GRAY }),
              new TextRun({ text: `$${Number(p.precio).toFixed(2)}`, size: 18, bold: true, color: ORANGE }),
            ],
          }),
        ],
      })
    }

    const body: any[] = [
      new Paragraph({
        children: [
          new TextRun({ text: 'BOOD ', bold: true, size: 40, color: NAVY, font: 'Arial' }),
          new TextRun({ text: 'SUPPLY', bold: true, size: 40, color: ORANGE, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Restaurant Supply Distributor', size: 18, color: '718096', italics: true })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'PRICE LIST / LISTA DE PRECIOS', bold: true, size: 26, color: NAVY })],
      }),
      new Paragraph({
        children: [new TextRun({ text: `Updated: ${fecha}`, italics: true, size: 18, color: '718096' })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: '(312) 409-0106  ·  boodsupplies@gmail.com  ·  www.boodsupply.com', size: 18, color: '2D3748' })],
        spacing: { after: 300 },
      }),
    ]

    for (const cat of categorias) {
      const prods = (productos || []).filter((p: any) => p.categoria === cat)
      body.push(
        new Paragraph({
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY },
          spacing: { before: 300, after: 0 },
          children: [
            new TextRun({ text: `  ${cat}  `, bold: true, size: 20, color: 'FFFFFF' }),
            new TextRun({ text: `${prods.length} productos`, size: 15, color: 'D6E0F0' }),
          ],
        })
      )

      const rows: TableRow[] = []
      for (let i = 0; i < prods.length; i += 3) {
        const chunk = prods.slice(i, i + 3)
        while (chunk.length < 3) chunk.push({ nombre: '', unidad: '', precio: '' } as any)
        rows.push(new TableRow({ children: chunk.map((p: any) => productCell(p)) }))
      }
      body.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }))
    }

    body.push(
      new Paragraph({
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Chemicals & Cleaning include 10.25% tax (IL) | Fuel Surcharge: $5.00 per delivery | Prices subject to change without notice',
            italics: true, size: 15, color: '718096',
          }),
        ],
      })
    )

    const doc = new Document({
      sections: [{ properties: {}, children: body }],
    })

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="BoodSupply_PriceList_${new Date().toISOString().slice(0, 10)}.docx"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
