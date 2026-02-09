import { z } from 'zod'

export const summarySchema = z.object({
  text: z.string().max(2000, 'Summary must be under 2000 characters'),
})
