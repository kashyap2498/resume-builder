import { z } from 'zod'

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string(),
  items: z.array(z.string()),
})

export const skillsSchema = z.array(skillCategorySchema)
