import { z } from 'zod'

export const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().regex(/^(\d+\.?\d*)?$/, 'Invalid GPA').or(z.literal('')),
  description: z.string(),
  highlights: z.array(z.string().max(500)),
})

export const educationSchema = z.array(educationEntrySchema)
