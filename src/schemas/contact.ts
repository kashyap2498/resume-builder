import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().regex(/^[\d\s\-+().]*$/, 'Invalid phone number').or(z.literal('')),
  location: z.string(),
  website: z.string().url('Invalid URL').or(z.literal('')),
  linkedin: z.string().url('Invalid URL').or(z.literal('')),
  github: z.string().url('Invalid URL').or(z.literal('')),
  portfolio: z.string().url('Invalid URL').or(z.literal('')),
  title: z.string(),
})
