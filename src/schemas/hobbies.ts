import { z } from 'zod'

export const hobbiesSchema = z.object({
  items: z.array(z.string()),
})
