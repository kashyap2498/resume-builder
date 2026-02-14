import { z } from 'zod'

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string().min(1, 'Category name is required'),
  items: z.array(z.string()),
})

export const skillsSchema = z.array(skillCategorySchema)
