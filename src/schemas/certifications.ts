import { z } from 'zod'

export const certificationEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string(),
  date: z.string(),
  expiryDate: z.string(),
  credentialId: z.string(),
  url: z.string().url('Invalid URL').or(z.literal('')),
})

export const certificationsSchema = z.array(certificationEntrySchema)
