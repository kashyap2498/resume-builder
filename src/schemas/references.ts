import { z } from 'zod'

export const referenceEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  title: z.string(),
  company: z.string(),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string(),
  relationship: z.string(),
})

export const referencesSchema = z.array(referenceEntrySchema)
