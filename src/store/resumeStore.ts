// =============================================================================
// Resume Builder - Main Resume Data Store
// =============================================================================

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  Resume,
  ContactData,
  SummaryData,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  ProjectEntry,
  CertificationEntry,
  LanguageEntry,
  VolunteerEntry,
  AwardEntry,
  PublicationEntry,
  ReferenceEntry,
  HobbiesData,
  AffiliationEntry,
  CourseEntry,
  CustomSection,
  CustomSectionEntry,
  SectionConfig,
} from '@/types/resume';
import type { ResumeStyling } from '@/types/styling';
import type { CoverLetterData } from '@/types/coverLetter';

// -- Helpers ------------------------------------------------------------------

const now = () => new Date().toISOString();

// -- Store Shape --------------------------------------------------------------

interface ResumeState {
  currentResume: Resume | null;
}

interface ResumeActions {
  // -- Resume-level -----------------------------------------------------------
  setResume: (resume: Resume | null) => void;
  setTemplateId: (templateId: string) => void;
  updateSections: (sections: SectionConfig[]) => void;
  updateStyling: (styling: ResumeStyling) => void;

  // -- Contact & Summary ------------------------------------------------------
  updateContact: (contact: Partial<ContactData>) => void;
  updateSummary: (summary: Partial<SummaryData>) => void;

  // -- Experience -------------------------------------------------------------
  addExperience: (entry: Omit<ExperienceEntry, 'id'>) => void;
  updateExperience: (id: string, entry: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (ids: string[]) => void;

  // -- Education --------------------------------------------------------------
  addEducation: (entry: Omit<EducationEntry, 'id'>) => void;
  updateEducation: (id: string, entry: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (ids: string[]) => void;

  // -- Skills -----------------------------------------------------------------
  updateSkills: (skills: SkillCategory[]) => void;

  // -- Projects ---------------------------------------------------------------
  addProject: (entry: Omit<ProjectEntry, 'id'>) => void;
  updateProject: (id: string, entry: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (ids: string[]) => void;

  // -- Certifications ---------------------------------------------------------
  addCertification: (entry: Omit<CertificationEntry, 'id'>) => void;
  updateCertification: (id: string, entry: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;
  reorderCertifications: (ids: string[]) => void;

  // -- Languages --------------------------------------------------------------
  addLanguage: (entry: Omit<LanguageEntry, 'id'>) => void;
  updateLanguage: (id: string, entry: Partial<LanguageEntry>) => void;
  removeLanguage: (id: string) => void;

  // -- Volunteer --------------------------------------------------------------
  addVolunteer: (entry: Omit<VolunteerEntry, 'id'>) => void;
  updateVolunteer: (id: string, entry: Partial<VolunteerEntry>) => void;
  removeVolunteer: (id: string) => void;

  // -- Awards -----------------------------------------------------------------
  addAward: (entry: Omit<AwardEntry, 'id'>) => void;
  updateAward: (id: string, entry: Partial<AwardEntry>) => void;
  removeAward: (id: string) => void;

  // -- Publications -----------------------------------------------------------
  addPublication: (entry: Omit<PublicationEntry, 'id'>) => void;
  updatePublication: (id: string, entry: Partial<PublicationEntry>) => void;
  removePublication: (id: string) => void;

  // -- References -------------------------------------------------------------
  addReference: (entry: Omit<ReferenceEntry, 'id'>) => void;
  updateReference: (id: string, entry: Partial<ReferenceEntry>) => void;
  removeReference: (id: string) => void;

  // -- Hobbies ----------------------------------------------------------------
  updateHobbies: (hobbies: HobbiesData) => void;

  // -- Affiliations -----------------------------------------------------------
  addAffiliation: (entry: Omit<AffiliationEntry, 'id'>) => void;
  updateAffiliation: (id: string, entry: Partial<AffiliationEntry>) => void;
  removeAffiliation: (id: string) => void;

  // -- Courses ----------------------------------------------------------------
  addCourse: (entry: Omit<CourseEntry, 'id'>) => void;
  updateCourse: (id: string, entry: Partial<CourseEntry>) => void;
  removeCourse: (id: string) => void;

  // -- Custom Sections --------------------------------------------------------
  addCustomSection: (section: Omit<CustomSection, 'id'>) => void;
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;

  // -- Cover Letter -----------------------------------------------------------
  updateCoverLetter: (coverLetter: Partial<CoverLetterData>) => void;
  clearCoverLetter: () => void;
}

export type ResumeStore = ResumeState & ResumeActions;

// -- Mutate helper (guards null resume) ---------------------------------------

type Mutator = (resume: Resume) => Resume;

function mutate(set: (fn: (s: ResumeState) => Partial<ResumeState>) => void, mutator: Mutator) {
  set((state) => {
    if (!state.currentResume) return state;
    const updated = mutator({ ...state.currentResume });
    return { currentResume: { ...updated, updatedAt: now() } };
  });
}

// -- Store --------------------------------------------------------------------

export const useResumeStore = create<ResumeStore>((set) => ({
  // -- State ------------------------------------------------------------------
  currentResume: null,

  // -- Resume-level -----------------------------------------------------------

  setResume: (resume) => {
    // Normalize old {name, proficiency} skill objects to plain strings
    if (resume?.data?.skills) {
      resume = {
        ...resume,
        data: {
          ...resume.data,
          skills: resume.data.skills.map((cat) => ({
            ...cat,
            items: cat.items.map((item: unknown) =>
              typeof item === 'object' && item !== null && 'name' in item
                ? String((item as { name: string }).name)
                : String(item),
            ),
          })),
        },
      };
    }
    set({ currentResume: resume });
  },

  setTemplateId: (templateId) =>
    mutate(set, (r) => ({ ...r, templateId })),

  updateSections: (sections) =>
    mutate(set, (r) => ({ ...r, sections })),

  updateStyling: (styling) =>
    mutate(set, (r) => ({ ...r, styling })),

  // -- Contact & Summary ------------------------------------------------------

  updateContact: (contact) =>
    mutate(set, (r) => ({
      ...r,
      data: { ...r.data, contact: { ...r.data.contact, ...contact } },
    })),

  updateSummary: (summary) =>
    mutate(set, (r) => ({
      ...r,
      data: { ...r.data, summary: { ...r.data.summary, ...summary } },
    })),

  // -- Experience -------------------------------------------------------------

  addExperience: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        experience: [...r.data.experience, { ...entry, id: nanoid() }],
      },
    })),

  updateExperience: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        experience: r.data.experience.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeExperience: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        experience: r.data.experience.filter((e) => e.id !== id),
      },
    })),

  reorderExperience: (ids) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        experience: ids.map((id) => r.data.experience.find((e) => e.id === id)!),
      },
    })),

  // -- Education --------------------------------------------------------------

  addEducation: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        education: [...r.data.education, { ...entry, id: nanoid() }],
      },
    })),

  updateEducation: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        education: r.data.education.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeEducation: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        education: r.data.education.filter((e) => e.id !== id),
      },
    })),

  reorderEducation: (ids) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        education: ids.map((id) => r.data.education.find((e) => e.id === id)!),
      },
    })),

  // -- Skills -----------------------------------------------------------------

  updateSkills: (skills) =>
    mutate(set, (r) => ({
      ...r,
      data: { ...r.data, skills },
    })),

  // -- Projects ---------------------------------------------------------------

  addProject: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        projects: [...r.data.projects, { ...entry, id: nanoid() }],
      },
    })),

  updateProject: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        projects: r.data.projects.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeProject: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        projects: r.data.projects.filter((e) => e.id !== id),
      },
    })),

  reorderProjects: (ids) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        projects: ids.map((id) => r.data.projects.find((e) => e.id === id)!),
      },
    })),

  // -- Certifications ---------------------------------------------------------

  addCertification: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        certifications: [...r.data.certifications, { ...entry, id: nanoid() }],
      },
    })),

  updateCertification: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        certifications: r.data.certifications.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeCertification: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        certifications: r.data.certifications.filter((e) => e.id !== id),
      },
    })),

  reorderCertifications: (ids) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        certifications: ids.map((id) => r.data.certifications.find((e) => e.id === id)!),
      },
    })),

  // -- Languages --------------------------------------------------------------

  addLanguage: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        languages: [...r.data.languages, { ...entry, id: nanoid() }],
      },
    })),

  updateLanguage: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        languages: r.data.languages.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeLanguage: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        languages: r.data.languages.filter((e) => e.id !== id),
      },
    })),

  // -- Volunteer --------------------------------------------------------------

  addVolunteer: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        volunteer: [...r.data.volunteer, { ...entry, id: nanoid() }],
      },
    })),

  updateVolunteer: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        volunteer: r.data.volunteer.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeVolunteer: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        volunteer: r.data.volunteer.filter((e) => e.id !== id),
      },
    })),

  // -- Awards -----------------------------------------------------------------

  addAward: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        awards: [...r.data.awards, { ...entry, id: nanoid() }],
      },
    })),

  updateAward: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        awards: r.data.awards.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeAward: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        awards: r.data.awards.filter((e) => e.id !== id),
      },
    })),

  // -- Publications -----------------------------------------------------------

  addPublication: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        publications: [...r.data.publications, { ...entry, id: nanoid() }],
      },
    })),

  updatePublication: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        publications: r.data.publications.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removePublication: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        publications: r.data.publications.filter((e) => e.id !== id),
      },
    })),

  // -- References -------------------------------------------------------------

  addReference: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        references: [...r.data.references, { ...entry, id: nanoid() }],
      },
    })),

  updateReference: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        references: r.data.references.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeReference: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        references: r.data.references.filter((e) => e.id !== id),
      },
    })),

  // -- Hobbies ----------------------------------------------------------------

  updateHobbies: (hobbies) =>
    mutate(set, (r) => ({
      ...r,
      data: { ...r.data, hobbies },
    })),

  // -- Affiliations -----------------------------------------------------------

  addAffiliation: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        affiliations: [...r.data.affiliations, { ...entry, id: nanoid() }],
      },
    })),

  updateAffiliation: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        affiliations: r.data.affiliations.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeAffiliation: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        affiliations: r.data.affiliations.filter((e) => e.id !== id),
      },
    })),

  // -- Courses ----------------------------------------------------------------

  addCourse: (entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        courses: [...r.data.courses, { ...entry, id: nanoid() }],
      },
    })),

  updateCourse: (id, entry) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        courses: r.data.courses.map((e) =>
          e.id === id ? { ...e, ...entry } : e,
        ),
      },
    })),

  removeCourse: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        courses: r.data.courses.filter((e) => e.id !== id),
      },
    })),

  // -- Custom Sections --------------------------------------------------------

  addCustomSection: (section) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        customSections: [
          ...r.data.customSections,
          { ...section, id: nanoid() },
        ],
      },
    })),

  updateCustomSection: (id, section) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        customSections: r.data.customSections.map((s) =>
          s.id === id ? { ...s, ...section } : s,
        ),
      },
    })),

  removeCustomSection: (id) =>
    mutate(set, (r) => ({
      ...r,
      data: {
        ...r.data,
        customSections: r.data.customSections.filter((s) => s.id !== id),
      },
    })),

  // -- Cover Letter -----------------------------------------------------------

  updateCoverLetter: (coverLetter) =>
    mutate(set, (r) => ({
      ...r,
      coverLetter: { ...r.coverLetter!, ...coverLetter },
    })),

  clearCoverLetter: () =>
    mutate(set, (r) => ({
      ...r,
      coverLetter: undefined,
    })),
}));
