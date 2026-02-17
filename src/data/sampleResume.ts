// =============================================================================
// Sample Resume Data — used for landing page template previews
// =============================================================================

import type { Resume } from '@/types/resume';

export const SAMPLE_RESUME: Resume = {
  id: 'sample-landing',
  name: 'Sample Resume',
  templateId: 'modern-clean',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  sections: [
    { id: 's-contact', type: 'contact', title: 'Contact', visible: true, order: 0 },
    { id: 's-summary', type: 'summary', title: 'Professional Summary', visible: true, order: 1 },
    { id: 's-experience', type: 'experience', title: 'Work Experience', visible: true, order: 2 },
    { id: 's-education', type: 'education', title: 'Education', visible: true, order: 3 },
    { id: 's-skills', type: 'skills', title: 'Skills', visible: true, order: 4 },
    { id: 's-projects', type: 'projects', title: 'Projects', visible: false, order: 5 },
    { id: 's-certifications', type: 'certifications', title: 'Certifications', visible: false, order: 6 },
    { id: 's-languages', type: 'languages', title: 'Languages', visible: false, order: 7 },
    { id: 's-volunteer', type: 'volunteer', title: 'Volunteer', visible: false, order: 8 },
    { id: 's-awards', type: 'awards', title: 'Awards', visible: false, order: 9 },
    { id: 's-publications', type: 'publications', title: 'Publications', visible: false, order: 10 },
    { id: 's-references', type: 'references', title: 'References', visible: false, order: 11 },
    { id: 's-hobbies', type: 'hobbies', title: 'Hobbies', visible: false, order: 12 },
    { id: 's-affiliations', type: 'affiliations', title: 'Affiliations', visible: false, order: 13 },
    { id: 's-courses', type: 'courses', title: 'Courses', visible: false, order: 14 },
    { id: 's-custom', type: 'customSections', title: 'Additional', visible: false, order: 15 },
  ],
  data: {
    contact: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '(415) 555-0142',
      location: 'San Francisco, CA',
      website: 'https://sarahmitchell.dev',
      linkedin: 'https://linkedin.com/in/sarahmitchell',
      github: 'https://github.com/smitchell',
      portfolio: '',
      title: 'Senior Product Designer',
    },
    summary: {
      text: 'Product designer with 6+ years of experience creating user-centered digital products. Led design systems serving 2M+ users across web and mobile platforms. Passionate about accessibility and data-driven design decisions.',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Stripe',
        position: 'Senior Product Designer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2023',
        endDate: '',
        current: true,
        description: '',
        highlights: [
          'Led redesign of merchant dashboard, improving task completion rate by 34%',
          'Built and maintained design system used by 40+ engineers across 3 product teams',
          'Conducted 50+ user interviews to inform product strategy and feature prioritization',
        ],
      },
      {
        id: 'exp-2',
        company: 'Figma',
        position: 'Product Designer',
        location: 'San Francisco, CA',
        startDate: 'Mar 2020',
        endDate: 'Dec 2022',
        current: false,
        description: '',
        highlights: [
          'Designed collaboration features used by 4M+ designers worldwide',
          'Reduced onboarding drop-off by 28% through iterative prototyping and A/B testing',
          'Mentored 3 junior designers and established design review process',
        ],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Human-Computer Interaction',
        startDate: '2017',
        endDate: '2019',
        gpa: '3.9',
        description: '',
        highlights: [],
      },
      {
        id: 'edu-2',
        institution: 'UC Berkeley',
        degree: 'Bachelor of Arts',
        field: 'Cognitive Science',
        startDate: '2013',
        endDate: '2017',
        gpa: '3.7',
        description: '',
        highlights: [],
      },
    ],
    skills: [
      {
        id: 'sk-1',
        category: 'Design',
        items: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
      },
      {
        id: 'sk-2',
        category: 'Technical',
        items: ['HTML/CSS', 'React', 'Design Systems', 'Accessibility (WCAG)'],
      },
      {
        id: 'sk-3',
        category: 'Research',
        items: ['User Interviews', 'A/B Testing', 'Usability Testing'],
      },
    ],
    skillsLayout: 'comma',
    skillsMode: 'categories',
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
  },
  styling: {
    font: {
      family: 'Inter, system-ui, sans-serif',
      headerFamily: 'Inter, system-ui, sans-serif',
      sizes: { name: 28, title: 14, sectionHeader: 16, normal: 11, small: 9 },
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    colors: {
      primary: '#1B2A4A',
      secondary: '#3D5A80',
      text: '#2D2D2D',
      lightText: '#6B7280',
      background: '#FFFFFF',
      headerBg: '#1B2A4A',
      headerText: '#FFFFFF',
      divider: '#D1D5DB',
      accent: '#3D5A80',
    },
    layout: {
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
      sectionSpacing: 20,
      itemSpacing: 12,
      columnLayout: 'single',
      sidebarWidth: 35,
      showDividers: true,
    },
    themeId: 'classic',
  },
};

/** Produce a copy of the sample resume with a specific template + theme applied. */
export function sampleWithTemplate(
  templateId: string,
  themeColors?: Partial<Resume['styling']['colors']>,
): Resume {
  return {
    ...SAMPLE_RESUME,
    templateId,
    styling: {
      ...SAMPLE_RESUME.styling,
      colors: themeColors
        ? { ...SAMPLE_RESUME.styling.colors, ...themeColors }
        : SAMPLE_RESUME.styling.colors,
    },
  };
}
