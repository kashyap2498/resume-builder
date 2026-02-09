import { z } from 'zod'

export const affiliationEntrySchema = z.object({
  id: z.string(),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export const affiliationsSchema = z.array(affiliationEntrySchema)
