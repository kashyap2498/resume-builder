import type { Resume, ResumeData } from '@/types/resume'
import type { ResumeStyling } from '@/types/styling'

export const mockStyling: ResumeStyling = {
  font: {
    family: 'Inter',
    headerFamily: 'Inter',
    sizes: { name: 24, title: 14, sectionHeader: 13, normal: 11, small: 9 },
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  colors: {
    primary: '#2563eb',
    secondary: '#475569',
    text: '#1e293b',
    lightText: '#64748b',
    background: '#ffffff',
    headerBg: '#f8fafc',
    headerText: '#0f172a',
    divider: '#e2e8f0',
    accent: '#3b82f6',
  },
  layout: {
    margins: { top: 24, right: 24, bottom: 24, left: 24 },
    sectionSpacing: 16,
    itemSpacing: 10,
    columnLayout: 'single',
    sidebarWidth: 35,
    showDividers: true,
  },
  themeId: null,
}

export const mockResumeData: ResumeData = {
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    location: 'New York, NY',
    website: 'https://johndoe.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: '',
    title: 'Software Engineer',
  },
  summary: {
    text: 'Experienced software engineer with 5+ years of experience building scalable web applications. Led teams of 10+ developers and increased system performance by 40%.',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      location: 'New York, NY',
      startDate: 'Jan 2020',
      endDate: '',
      current: true,
      description: 'Led frontend team for main product.',
      highlights: [
        'Developed a new React-based dashboard that improved user engagement by 35%',
        'Led a team of 8 engineers to deliver critical features on time',
        'Reduced page load times by 50% through code optimization',
      ],
    },
    {
      id: 'exp-2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: 'Jun 2017',
      endDate: 'Dec 2019',
      current: false,
      description: 'Built product from scratch.',
      highlights: [
        'Built RESTful APIs serving 100,000+ daily requests',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'MIT',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2013',
      endDate: '2017',
      gpa: '3.8',
      description: '',
      highlights: ['Dean\'s List', 'Capstone project on machine learning'],
    },
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Programming Languages',
      items: [
        { name: 'TypeScript', proficiency: 5 },
        { name: 'Python', proficiency: 4 },
        { name: 'Go', proficiency: 3 },
      ],
    },
    {
      id: 'skill-2',
      category: 'Frameworks',
      items: [
        { name: 'React', proficiency: 5 },
        { name: 'Node.js', proficiency: 4 },
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Resume Builder',
      description: 'A comprehensive resume builder with 18 templates.',
      technologies: ['React', 'TypeScript', 'Tailwind'],
      url: 'https://github.com/johndoe/resume-builder',
      startDate: '2024',
      endDate: '2024',
      highlights: ['Built 18 customizable templates', 'Implemented ATS scoring'],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon',
      date: '2023',
      expiryDate: '2026',
      credentialId: 'ABC123',
      url: '',
    },
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'native' },
    { id: 'lang-2', name: 'Spanish', proficiency: 'intermediate' },
  ],
  volunteer: [
    {
      id: 'vol-1',
      organization: 'Code for Good',
      role: 'Mentor',
      startDate: '2021',
      endDate: '',
      description: 'Teaching coding to underprivileged youth.',
      highlights: ['Mentored 20+ students'],
    },
  ],
  awards: [
    {
      id: 'award-1',
      title: 'Best Innovation Award',
      issuer: 'Tech Corp',
      date: '2022',
      description: 'Awarded for developing an AI-powered feature.',
    },
  ],
  publications: [
    {
      id: 'pub-1',
      title: 'Scaling React Applications',
      publisher: 'Tech Blog',
      date: '2023',
      url: '',
      description: 'Best practices for scaling large React apps.',
    },
  ],
  references: [],
  hobbies: { items: ['Open Source', 'Hiking', 'Photography'] },
  affiliations: [],
  courses: [],
  customSections: [],
}

export const mockResume: Resume = {
  id: 'test-resume-1',
  name: 'Test Resume',
  templateId: 'ats-standard',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  sections: [
    { id: 'sec-contact', type: 'contact', title: 'Contact', visible: true, order: 0 },
    { id: 'sec-summary', type: 'summary', title: 'Summary', visible: true, order: 1 },
    { id: 'sec-experience', type: 'experience', title: 'Experience', visible: true, order: 2 },
    { id: 'sec-education', type: 'education', title: 'Education', visible: true, order: 3 },
    { id: 'sec-skills', type: 'skills', title: 'Skills', visible: true, order: 4 },
    { id: 'sec-projects', type: 'projects', title: 'Projects', visible: true, order: 5 },
  ],
  data: mockResumeData,
  styling: mockStyling,
}

export function createEmptyResumeData(): ResumeData {
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
    summary: { text: '' },
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
  }
}

export function createEmptyResume(overrides?: Partial<Resume>): Resume {
  return {
    id: 'empty-resume',
    name: 'Empty Resume',
    templateId: 'ats-standard',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    sections: [],
    data: createEmptyResumeData(),
    styling: mockStyling,
    ...overrides,
  }
}
