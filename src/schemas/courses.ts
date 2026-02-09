import { z } from 'zod'

export const courseEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Course name is required'),
  institution: z.string(),
  completionDate: z.string(),
  description: z.string(),
})

export const coursesSchema = z.array(courseEntrySchema)
