import { z } from 'zod'
import { contactSchema } from './contact'
import { summarySchema } from './summary'
import { experienceSchema } from './experience'
import { educationSchema } from './education'
import { skillsSchema } from './skills'
import { projectsSchema } from './projects'
import { certificationsSchema } from './certifications'
import { languagesSchema } from './languages'
import { volunteerSchema } from './volunteer'
import { awardsSchema } from './awards'
import { publicationsSchema } from './publications'
import { referencesSchema } from './references'
import { hobbiesSchema } from './hobbies'
import { affiliationsSchema } from './affiliations'
import { coursesSchema } from './courses'
import { customSectionsSchema } from './customSections'

export * from './contact'
export * from './summary'
export * from './experience'
export * from './education'
export * from './skills'
export * from './projects'
export * from './certifications'
export * from './languages'
export * from './volunteer'
export * from './awards'
export * from './publications'
export * from './references'
export * from './hobbies'
export * from './affiliations'
export * from './courses'
export * from './customSections'

export const resumeDataSchema = z.object({
  contact: contactSchema,
  summary: summarySchema,
  experience: experienceSchema,
  education: educationSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  certifications: certificationsSchema,
  languages: languagesSchema,
  volunteer: volunteerSchema,
  awards: awardsSchema,
  publications: publicationsSchema,
  references: referencesSchema,
  hobbies: hobbiesSchema,
  affiliations: affiliationsSchema,
  courses: coursesSchema,
  customSections: customSectionsSchema,
})

export const sectionConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  visible: z.boolean(),
  order: z.number(),
})

export const resumeStylingSchema = z.object({
  font: z.object({
    family: z.string(),
    headerFamily: z.string(),
    sizes: z.object({
      name: z.number(),
      title: z.number(),
      sectionHeader: z.number(),
      normal: z.number(),
      small: z.number(),
    }),
    lineHeight: z.number(),
    letterSpacing: z.number(),
  }),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    text: z.string(),
    lightText: z.string(),
    background: z.string(),
    headerBg: z.string(),
    headerText: z.string(),
    divider: z.string(),
    accent: z.string(),
  }),
  layout: z.object({
    margins: z.object({ top: z.number(), right: z.number(), bottom: z.number(), left: z.number() }),
    sectionSpacing: z.number(),
    itemSpacing: z.number(),
    columnLayout: z.enum(['single', 'two-column']),
    sidebarWidth: z.number(),
    showDividers: z.boolean(),
  }),
  themeId: z.string().nullable(),
})

export const resumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  templateId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sections: z.array(sectionConfigSchema),
  data: resumeDataSchema,
  styling: resumeStylingSchema,
})
