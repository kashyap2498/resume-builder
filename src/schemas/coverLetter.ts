import { z } from 'zod'

export const coverLetterSchema = z.object({
  recipientName: z.string(),
  recipientTitle: z.string(),
  companyName: z.string(),
  companyAddress: z.string(),
  date: z.string(),
  salutation: z.string(),
  openingParagraph: z.string(),
  bodyParagraph: z.string(),
  closingParagraph: z.string(),
  signOff: z.string(),
})
