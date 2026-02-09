// =============================================================================
// Resume Builder - Default Section Configurations & Resume Factory
// =============================================================================

import { nanoid } from 'nanoid';
import type { SectionConfig, Resume, ResumeData } from '@/types/resume';
import type { ResumeStyling } from '@/types/styling';
import { DEFAULT_FONT_SIZES } from './fonts';
import { COLOR_THEMES, DEFAULT_THEME_ID } from './colorThemes';

// -- Default Section Order & Visibility ---------------------------------------

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'section-contact',        type: 'contact',        title: 'Contact',           visible: true,  order: 0 },
  { id: 'section-summary',        type: 'summary',        title: 'Professional Summary', visible: true,  order: 1 },
  { id: 'section-experience',     type: 'experience',     title: 'Work Experience',   visible: true,  order: 2 },
  { id: 'section-education',      type: 'education',      title: 'Education',         visible: true,  order: 3 },
  { id: 'section-skills',         type: 'skills',         title: 'Skills',            visible: true,  order: 4 },
  { id: 'section-projects',       type: 'projects',       title: 'Projects',          visible: false, order: 5 },
  { id: 'section-certifications', type: 'certifications', title: 'Certifications',    visible: false, order: 6 },
  { id: 'section-languages',      type: 'languages',      title: 'Languages',         visible: false, order: 7 },
  { id: 'section-volunteer',      type: 'volunteer',      title: 'Volunteer Experience', visible: false, order: 8 },
  { id: 'section-awards',         type: 'awards',         title: 'Awards & Honors',   visible: false, order: 9 },
  { id: 'section-publications',   type: 'publications',   title: 'Publications',      visible: false, order: 10 },
  { id: 'section-references',     type: 'references',     title: 'References',        visible: false, order: 11 },
  { id: 'section-hobbies',        type: 'hobbies',        title: 'Hobbies & Interests', visible: false, order: 12 },
  { id: 'section-affiliations',   type: 'affiliations',   title: 'Professional Affiliations', visible: false, order: 13 },
  { id: 'section-courses',        type: 'courses',        title: 'Courses',           visible: false, order: 14 },
  { id: 'section-customSections', type: 'customSections', title: 'Additional',        visible: false, order: 15 },
];

// -- Empty Resume Data --------------------------------------------------------

function createEmptyResumeData(): ResumeData {
  return {
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: '',
      title: '',
    },
    summary: {
      text: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    volunteer: [],
    awards: [],
    publications: [],
    references: [],
    hobbies: { items: [] },
    affiliations: [],
    courses: [],
    customSections: [],
  };
}

// -- Default Styling ----------------------------------------------------------

function createDefaultStyling(): ResumeStyling {
  const theme = COLOR_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ?? COLOR_THEMES[0];

  return {
    font: {
      family: 'Inter, system-ui, sans-serif',
      headerFamily: 'Inter, system-ui, sans-serif',
      sizes: { ...DEFAULT_FONT_SIZES },
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    colors: { ...theme.colors },
    layout: {
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
      sectionSpacing: 20,
      itemSpacing: 12,
      columnLayout: 'single',
      sidebarWidth: 35,
      showDividers: true,
    },
    themeId: DEFAULT_THEME_ID,
  };
}

// -- Resume Factory -----------------------------------------------------------

/**
 * Creates a brand-new Resume object with empty data and default styling.
 *
 * @param name       - A human-readable name for the resume (e.g. "My Resume").
 * @param templateId - The template to apply (e.g. "professional", "modern").
 * @returns A fully-formed Resume ready to be stored and edited.
 */
export function createDefaultResume(name: string, templateId: string): Resume {
  const now = new Date().toISOString();

  return {
    id: nanoid(),
    name,
    templateId,
    createdAt: now,
    updatedAt: now,
    sections: DEFAULT_SECTIONS.map((section) => ({ ...section })),
    data: createEmptyResumeData(),
    styling: createDefaultStyling(),
  };
}
