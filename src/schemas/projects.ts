import { z } from 'zod'

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().url('Invalid URL').or(z.literal('')),
  startDate: z.string(),
  endDate: z.string(),
  highlights: z.array(z.string().max(500)),
})

export const projectsSchema = z.array(projectEntrySchema)
