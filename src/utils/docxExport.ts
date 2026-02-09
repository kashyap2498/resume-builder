import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import type { Resume } from '@/types/resume'

export async function exportResumeAsDocx(resume: Resume): Promise<void> {
  const { data, styling } = resume
  const sections: Paragraph[] = []

  // Name
  const fullName = [data.contact.firstName, data.contact.lastName].filter(Boolean).join(' ') || 'Resume'
  sections.push(new Paragraph({
    children: [new TextRun({ text: fullName, bold: true, size: (styling.font.sizes.name || 24) * 2, font: styling.font.headerFamily || 'Calibri' })],
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }))

  // Title
  if (data.contact.title) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: data.contact.title, size: 24, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }))
  }

  // Contact line
  const contactParts = [data.contact.email, data.contact.phone, data.contact.location, data.contact.website, data.contact.linkedin].filter(Boolean)
  if (contactParts.length > 0) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '888888' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }))
  }

  // Helper to add section header
  const addSectionHeader = (title: string) => {
    sections.push(new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, font: styling.font.headerFamily || 'Calibri' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
    }))
  }

  // Iterate visible sections in order
  for (const section of resume.sections.filter(s => s.visible && s.type !== 'contact').sort((a, b) => a.order - b.order)) {
    switch (section.type) {
      case 'summary':
        if (data.summary.text) {
          addSectionHeader(section.title)
          sections.push(new Paragraph({ children: [new TextRun({ text: data.summary.text, size: 20 })], spacing: { after: 100 } }))
        }
        break

      case 'experience':
        if (data.experience.length > 0) {
          addSectionHeader(section.title)
          for (const exp of data.experience) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: exp.position, bold: true, size: 20 }),
                new TextRun({ text: ` at ${exp.company}`, size: 20 }),
              ],
              spacing: { before: 120 },
            }))
            const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ')
            if (dateStr || exp.location) {
              sections.push(new Paragraph({
                children: [new TextRun({ text: [dateStr, exp.location].filter(Boolean).join(' | '), size: 18, color: '888888', italics: true })],
              }))
            }
            for (const h of exp.highlights) {
              sections.push(new Paragraph({
                children: [new TextRun({ text: h, size: 20 })],
                bullet: { level: 0 },
                spacing: { before: 40 },
              }))
            }
          }
        }
        break

      case 'education':
        if (data.education.length > 0) {
          addSectionHeader(section.title)
          for (const edu of data.education) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: edu.degree, bold: true, size: 20 }),
                new TextRun({ text: edu.field ? ` in ${edu.field}` : '', size: 20 }),
              ],
              spacing: { before: 120 },
            }))
            sections.push(new Paragraph({
              children: [new TextRun({ text: [edu.institution, [edu.startDate, edu.endDate].filter(Boolean).join(' - ')].filter(Boolean).join(' | '), size: 18, color: '888888', italics: true })],
            }))
            if (edu.gpa) {
              sections.push(new Paragraph({ children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 18 })] }))
            }
            for (const h of edu.highlights) {
              sections.push(new Paragraph({ children: [new TextRun({ text: h, size: 20 })], bullet: { level: 0 }, spacing: { before: 40 } }))
            }
          }
        }
        break

      case 'skills':
        if (data.skills.length > 0) {
          addSectionHeader(section.title)
          for (const cat of data.skills) {
            const skillNames = cat.items.map(s => s.name).join(', ')
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: `${cat.category}: `, bold: true, size: 20 }),
                new TextRun({ text: skillNames, size: 20 }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'projects':
        if (data.projects.length > 0) {
          addSectionHeader(section.title)
          for (const proj of data.projects) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: proj.name, bold: true, size: 20 })],
              spacing: { before: 120 },
            }))
            if (proj.technologies.length > 0) {
              sections.push(new Paragraph({ children: [new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, size: 18, italics: true })] }))
            }
            if (proj.description) {
              sections.push(new Paragraph({ children: [new TextRun({ text: proj.description, size: 20 })], spacing: { before: 40 } }))
            }
            for (const h of proj.highlights) {
              sections.push(new Paragraph({ children: [new TextRun({ text: h, size: 20 })], bullet: { level: 0 }, spacing: { before: 40 } }))
            }
          }
        }
        break

      case 'certifications':
        if (data.certifications.length > 0) {
          addSectionHeader(section.title)
          for (const cert of data.certifications) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: cert.name, bold: true, size: 20 }),
                new TextRun({ text: cert.issuer ? ` - ${cert.issuer}` : '', size: 20 }),
                new TextRun({ text: cert.date ? ` (${cert.date})` : '', size: 18, color: '888888' }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'languages':
        if (data.languages.length > 0) {
          addSectionHeader(section.title)
          const langText = data.languages.map(l => `${l.name} (${l.proficiency})`).join(', ')
          sections.push(new Paragraph({ children: [new TextRun({ text: langText, size: 20 })] }))
        }
        break

      case 'volunteer':
        if (data.volunteer.length > 0) {
          addSectionHeader(section.title)
          for (const vol of data.volunteer) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: vol.role || vol.organization, bold: true, size: 20 }),
                new TextRun({ text: vol.role ? ` at ${vol.organization}` : '', size: 20 }),
              ],
              spacing: { before: 120 },
            }))
            for (const h of vol.highlights) {
              sections.push(new Paragraph({ children: [new TextRun({ text: h, size: 20 })], bullet: { level: 0 }, spacing: { before: 40 } }))
            }
          }
        }
        break

      case 'awards':
        if (data.awards.length > 0) {
          addSectionHeader(section.title)
          for (const award of data.awards) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: award.title, bold: true, size: 20 }),
                new TextRun({ text: award.issuer ? ` - ${award.issuer}` : '', size: 20 }),
                new TextRun({ text: award.date ? ` (${award.date})` : '', size: 18, color: '888888' }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'publications':
        if (data.publications.length > 0) {
          addSectionHeader(section.title)
          for (const pub of data.publications) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: pub.title, bold: true, size: 20 }),
                new TextRun({ text: pub.publisher ? ` - ${pub.publisher}` : '', size: 20 }),
                new TextRun({ text: pub.date ? ` (${pub.date})` : '', size: 18, color: '888888' }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'references':
        if (data.references.length > 0) {
          addSectionHeader(section.title)
          for (const ref of data.references) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: ref.name, bold: true, size: 20 }),
                new TextRun({ text: [ref.title, ref.company].filter(Boolean).join(', ') ? ` - ${[ref.title, ref.company].filter(Boolean).join(', ')}` : '', size: 20 }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'hobbies':
        if (data.hobbies.items.length > 0) {
          addSectionHeader(section.title)
          sections.push(new Paragraph({ children: [new TextRun({ text: data.hobbies.items.join(', '), size: 20 })] }))
        }
        break

      case 'affiliations':
        if (data.affiliations.length > 0) {
          addSectionHeader(section.title)
          for (const aff of data.affiliations) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: aff.organization, bold: true, size: 20 }),
                new TextRun({ text: aff.role ? ` - ${aff.role}` : '', size: 20 }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break

      case 'courses':
        if (data.courses.length > 0) {
          addSectionHeader(section.title)
          for (const course of data.courses) {
            sections.push(new Paragraph({
              children: [
                new TextRun({ text: course.name, bold: true, size: 20 }),
                new TextRun({ text: course.institution ? ` - ${course.institution}` : '', size: 20 }),
              ],
              spacing: { before: 60 },
            }))
          }
        }
        break
    }
  }

  const doc = new Document({
    sections: [{ children: sections }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const safeName = (resume.name || 'resume').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100)
  link.download = `${safeName}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
