import { z } from 'zod'

export const awardEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Award title is required'),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
})

export const awardsSchema = z.array(awardEntrySchema)
