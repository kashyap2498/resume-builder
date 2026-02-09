import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import type { Resume } from '@/types/resume'

export async function exportCoverLetterAsDocx(resume: Resume): Promise<void> {
  const cl = resume.coverLetter
  if (!cl) return

  const { data, styling } = resume
  const contact = data.contact
  const paragraphs: Paragraph[] = []
  const fontFamily = styling.font.headerFamily || 'Calibri'

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  const contactParts = [contact.email, contact.phone, contact.location].filter(Boolean)

  // Sender Name
  if (fullName) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: fullName, bold: true, size: (styling.font.sizes.name || 24) * 2, font: fontFamily })],
      spacing: { after: 40 },
    }))
  }

  // Contact Line
  if (contactParts.length > 0) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '888888' })],
      spacing: { after: 200 },
    }))
  }

  // Date
  if (cl.date) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.date, size: 20 })],
      spacing: { after: 200 },
    }))
  }

  // Recipient Block
  if (cl.recipientName) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.recipientName, size: 20 })],
    }))
  }
  if (cl.recipientTitle) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.recipientTitle, size: 20 })],
    }))
  }
  if (cl.companyName) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.companyName, size: 20 })],
    }))
  }
  if (cl.companyAddress) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.companyAddress, size: 20 })],
      spacing: { after: 200 },
    }))
  }

  // Salutation
  if (cl.salutation) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.salutation, bold: true, size: 20 })],
      spacing: { after: 120 },
    }))
  }

  // Opening Paragraph
  if (cl.openingParagraph) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.openingParagraph, size: 20 })],
      spacing: { after: 120 },
    }))
  }

  // Body Paragraph
  if (cl.bodyParagraph) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.bodyParagraph, size: 20 })],
      spacing: { after: 120 },
    }))
  }

  // Closing Paragraph
  if (cl.closingParagraph) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.closingParagraph, size: 20 })],
      spacing: { after: 200 },
    }))
  }

  // Sign-off
  if (cl.signOff) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: cl.signOff, size: 20 })],
      spacing: { after: 40 },
    }))
  }

  // Sender Name (signature)
  if (fullName) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: fullName, bold: true, size: 20 })],
    }))
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const safeName = (resume.name || 'cover-letter').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100)
  link.download = `${safeName}_cover_letter.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
