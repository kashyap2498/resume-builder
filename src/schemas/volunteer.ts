import { z } from 'zod'

export const volunteerEntrySchema = z.object({
  id: z.string(),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  highlights: z.array(z.string().max(500)),
})

export const volunteerSchema = z.array(volunteerEntrySchema)
