import { z } from 'zod'

export const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  description: z.string(),
  highlights: z.array(z.string().max(500)),
})

export const experienceSchema = z.array(experienceEntrySchema)
