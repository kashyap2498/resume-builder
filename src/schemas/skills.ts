import { z } from 'zod'

export const skillItemSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiency: z.number().int().min(1).max(5),
})

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string().min(1, 'Category name is required'),
  items: z.array(skillItemSchema),
})

export const skillsSchema = z.array(skillCategorySchema)
