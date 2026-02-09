// =============================================================================
// Resume Builder - Core Resume Type Definitions
// =============================================================================

import type { ResumeStyling } from './styling';
import type { CoverLetterData } from './coverLetter';

// -- Section Types ------------------------------------------------------------

export type SectionType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'volunteer'
  | 'awards'
  | 'publications'
  | 'references'
  | 'hobbies'
  | 'affiliations'
  | 'courses'
  | 'customSections';

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
}

// -- Contact ------------------------------------------------------------------

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  portfolio: string;
  title: string;
}

// -- Summary ------------------------------------------------------------------

export interface SummaryData {
  text: string;
}

// -- Experience ---------------------------------------------------------------

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

// -- Education ----------------------------------------------------------------

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  highlights: string[];
}

// -- Skills -------------------------------------------------------------------

export type SkillProficiency = 1 | 2 | 3 | 4 | 5;

export interface SkillItem {
  name: string;
  proficiency: SkillProficiency;
}

export interface SkillCategory {
  id: string;
  category: string;
  items: SkillItem[];
}

// -- Projects -----------------------------------------------------------------

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

// -- Certifications -----------------------------------------------------------

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
  url: string;
}

// -- Languages ----------------------------------------------------------------

export type LanguageProficiency =
  | 'native'
  | 'fluent'
  | 'advanced'
  | 'intermediate'
  | 'beginner';

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

// -- Volunteer ----------------------------------------------------------------

export interface VolunteerEntry {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

// -- Awards -------------------------------------------------------------------

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

// -- Publications -------------------------------------------------------------

export interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
}

// -- References ---------------------------------------------------------------

export interface ReferenceEntry {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

// -- Hobbies ------------------------------------------------------------------

export interface HobbiesData {
  items: string[];
}

// -- Affiliations -------------------------------------------------------------

export interface AffiliationEntry {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
}

// -- Courses ------------------------------------------------------------------

export interface CourseEntry {
  id: string;
  name: string;
  institution: string;
  completionDate: string;
  description: string;
}

// -- Custom Sections ----------------------------------------------------------

export interface CustomSectionEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  highlights: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  entries: CustomSectionEntry[];
}

// -- Resume Data (all section data) -------------------------------------------

export interface ResumeData {
  contact: ContactData;
  summary: SummaryData;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  volunteer: VolunteerEntry[];
  awards: AwardEntry[];
  publications: PublicationEntry[];
  references: ReferenceEntry[];
  hobbies: HobbiesData;
  affiliations: AffiliationEntry[];
  courses: CourseEntry[];
  customSections: CustomSection[];
}

// -- Resume (top-level) -------------------------------------------------------

export interface Resume {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  sections: SectionConfig[];
  data: ResumeData;
  styling: ResumeStyling;
  coverLetter?: CoverLetterData;
}
