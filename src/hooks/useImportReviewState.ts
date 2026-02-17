import { useState, useCallback, useMemo } from 'react';
import type {
  ResumeData,
  ContactData,
  ExperienceEntry,
  EducationEntry,
  SkillCategory,
  CertificationEntry,
  ProjectEntry,
  LanguageEntry,
  VolunteerEntry,
  AwardEntry,
  PublicationEntry,
  ReferenceEntry,
  HobbiesData,
  AffiliationEntry,
  CourseEntry,
} from '@/types/resume';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ArraySection =
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'languages'
  | 'volunteer'
  | 'awards'
  | 'publications'
  | 'references'
  | 'affiliations'
  | 'courses';

type ConfidenceLevel = 'complete' | 'incomplete' | 'empty';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultContact: ContactData = {
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
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useImportReviewState(parsedData: Partial<ResumeData>) {
  // -- Individual state per section ------------------------------------------

  const [contact, setContact] = useState<ContactData>(() => ({
    ...defaultContact,
    ...parsedData.contact,
  }));
  const [summary, setSummary] = useState<string>(
    () => parsedData.summary?.text ?? '',
  );
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    () => parsedData.experience ?? [],
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    () => parsedData.education ?? [],
  );
  const [skills, setSkills] = useState<SkillCategory[]>(
    () => parsedData.skills ?? [],
  );
  const [certifications, setCertifications] = useState<CertificationEntry[]>(
    () => parsedData.certifications ?? [],
  );
  const [projects, setProjects] = useState<ProjectEntry[]>(
    () => parsedData.projects ?? [],
  );
  const [languages, setLanguages] = useState<LanguageEntry[]>(
    () => parsedData.languages ?? [],
  );
  const [volunteer, setVolunteer] = useState<VolunteerEntry[]>(
    () => parsedData.volunteer ?? [],
  );
  const [awards, setAwards] = useState<AwardEntry[]>(
    () => parsedData.awards ?? [],
  );
  const [publications, setPublications] = useState<PublicationEntry[]>(
    () => parsedData.publications ?? [],
  );
  const [references, setReferences] = useState<ReferenceEntry[]>(
    () => parsedData.references ?? [],
  );
  const [hobbies, setHobbies] = useState<HobbiesData>(
    () => parsedData.hobbies ?? { items: [] },
  );
  const [affiliations, setAffiliations] = useState<AffiliationEntry[]>(
    () => parsedData.affiliations ?? [],
  );
  const [courses, setCourses] = useState<CourseEntry[]>(
    () => parsedData.courses ?? [],
  );

  // -- Unmatched content state -----------------------------------------------

  const [unmatchedChunks, setUnmatchedChunks] = useState<
    Array<{ text: string; startOffset: number; endOffset: number }>
  >([]);

  const initUnmatchedChunks = useCallback(
    (chunks: Array<{ text: string; startOffset: number; endOffset: number }>) => {
      setUnmatchedChunks(chunks);
    },
    [],
  );

  const skipUnmatchedChunk = useCallback((index: number) => {
    setUnmatchedChunks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addUnmatchedAs = useCallback((chunkIndex: number, _sectionType: string) => {
    setUnmatchedChunks((prev) => prev.filter((_, i) => i !== chunkIndex));
  }, []);

  // -- Section state map (for generic array operations) ----------------------

  type ArrayEntry =
    | ExperienceEntry
    | EducationEntry
    | SkillCategory
    | CertificationEntry
    | ProjectEntry
    | LanguageEntry
    | VolunteerEntry
    | AwardEntry
    | PublicationEntry
    | ReferenceEntry
    | AffiliationEntry
    | CourseEntry;

  const sectionStateMap: Record<
    ArraySection,
    {
      get: () => ArrayEntry[];
      set: React.Dispatch<React.SetStateAction<ArrayEntry[]>>;
    }
  > = useMemo(
    () => ({
      experience: {
        get: () => experience,
        set: setExperience as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      education: {
        get: () => education,
        set: setEducation as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      skills: {
        get: () => skills,
        set: setSkills as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      certifications: {
        get: () => certifications,
        set: setCertifications as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      projects: {
        get: () => projects,
        set: setProjects as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      languages: {
        get: () => languages,
        set: setLanguages as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      volunteer: {
        get: () => volunteer,
        set: setVolunteer as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      awards: {
        get: () => awards,
        set: setAwards as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      publications: {
        get: () => publications,
        set: setPublications as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      references: {
        get: () => references,
        set: setReferences as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      affiliations: {
        get: () => affiliations,
        set: setAffiliations as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
      courses: {
        get: () => courses,
        set: setCourses as React.Dispatch<React.SetStateAction<ArrayEntry[]>>,
      },
    }),
    [
      experience, education, skills, certifications, projects, languages,
      volunteer, awards, publications, references, affiliations, courses,
    ],
  );

  // -- Actions ---------------------------------------------------------------

  const updateContact = useCallback(
    (field: keyof ContactData, value: string) => {
      setContact((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateSummary = useCallback((text: string) => {
    setSummary(text);
  }, []);

  const updateEntry = useCallback(
    (section: string, index: number, updates: Record<string, unknown>) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      s.set((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    [sectionStateMap],
  );

  const removeEntry = useCallback(
    (section: string, index: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      s.set((prev) => prev.filter((_, i) => i !== index));
    },
    [sectionStateMap],
  );

  const addEntry = useCallback(
    (section: string, entry: unknown) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      s.set((prev) => [...prev, entry as ArrayEntry]);
    },
    [sectionStateMap],
  );

  const swapPositionCompany = useCallback(
    (index: number) => {
      setExperience((prev) => {
        const next = [...prev];
        const entry = { ...next[index] };
        const tmp = entry.position;
        entry.position = entry.company;
        entry.company = tmp;
        next[index] = entry;
        return next;
      });
    },
    [],
  );

  const splitEntry = useCallback(
    (entryIndex: number, bulletIndex: number) => {
      setExperience((prev) => {
        const source = prev[entryIndex];
        if (!source) return prev;

        const highlightsBefore = source.highlights.slice(0, bulletIndex);
        const flaggedBullet = source.highlights[bulletIndex];
        const highlightsAfter = source.highlights.slice(bulletIndex + 1);

        const updated: ExperienceEntry = {
          ...source,
          highlights: highlightsBefore,
        };

        const newEntry: ExperienceEntry = {
          id: generateId(),
          company: source.company,
          position: flaggedBullet ?? '',
          location: source.location,
          startDate: source.startDate,
          endDate: source.endDate,
          current: source.current,
          description: '',
          highlights: highlightsAfter,
        };

        const next = [...prev];
        next[entryIndex] = updated;
        next.splice(entryIndex + 1, 0, newEntry);
        return next;
      });
    },
    [],
  );

  const mergeEntries = useCallback(
    (section: string, indexA: number, indexB: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;

      if (section === 'experience') {
        setExperience((prev) => {
          const a = prev[indexA];
          const b = prev[indexB];
          if (!a || !b) return prev;

          const merged: ExperienceEntry = {
            ...a,
            highlights: [...a.highlights, ...b.highlights],
          };

          const next = [...prev];
          next[indexA] = merged;
          next.splice(indexB, 1);
          return next;
        });
      } else {
        s.set((prev) => prev.filter((_, i) => i !== indexB));
      }
    },
    [sectionStateMap],
  );

  const reorderEntries = useCallback(
    (section: string, fromIndex: number, toIndex: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      s.set((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [sectionStateMap],
  );

  // -- Confidence ------------------------------------------------------------

  const getSectionConfidence = useCallback(
    (section: string): ConfidenceLevel => {
      switch (section) {
        case 'contact':
          if (contact.firstName && contact.email) return 'complete';
          if (contact.firstName || contact.email) return 'incomplete';
          return 'empty';

        case 'summary':
          return summary.length > 0 ? 'complete' : 'empty';

        case 'experience':
          if (experience.length === 0) return 'empty';
          return experience.every((e) => e.company && e.position)
            ? 'complete'
            : 'incomplete';

        case 'education':
          if (education.length === 0) return 'empty';
          return education.every((e) => e.institution)
            ? 'complete'
            : 'incomplete';

        case 'skills':
          return skills.length > 0 ? 'complete' : 'empty';

        case 'projects':
          if (projects.length === 0) return 'empty';
          return projects.every((p) => p.name) ? 'complete' : 'incomplete';

        case 'certifications':
          if (certifications.length === 0) return 'empty';
          return certifications.every((c) => c.name)
            ? 'complete'
            : 'incomplete';

        case 'languages':
          if (languages.length === 0) return 'empty';
          return languages.every((l) => l.name) ? 'complete' : 'incomplete';

        default: {
          const s = sectionStateMap[section as ArraySection];
          if (!s) return 'empty';
          return s.get().length > 0 ? 'complete' : 'empty';
        }
      }
    },
    [
      contact, summary, experience, education, skills,
      projects, certifications, languages, sectionStateMap,
    ],
  );

  // -- Build output ----------------------------------------------------------

  const buildPartialResumeData = useCallback((): Partial<ResumeData> => {
    const result: Partial<ResumeData> = {};

    if (contact.firstName || contact.lastName || contact.email) {
      result.contact = contact;
    }
    if (summary) {
      result.summary = { text: summary };
    }
    if (experience.length > 0) result.experience = experience;
    if (education.length > 0) result.education = education;
    if (skills.length > 0) result.skills = skills;
    if (certifications.length > 0) result.certifications = certifications;
    if (projects.length > 0) result.projects = projects;
    if (languages.length > 0) result.languages = languages;
    if (volunteer.length > 0) result.volunteer = volunteer;
    if (awards.length > 0) result.awards = awards;
    if (publications.length > 0) result.publications = publications;
    if (references.length > 0) result.references = references;
    if (hobbies.items.length > 0) result.hobbies = hobbies;
    if (affiliations.length > 0) result.affiliations = affiliations;
    if (courses.length > 0) result.courses = courses;

    return result;
  }, [
    contact, summary, experience, education, skills, certifications,
    projects, languages, volunteer, awards, publications, references,
    hobbies, affiliations, courses,
  ]);

  // -- Return ----------------------------------------------------------------

  return {
    // State
    contact,
    summary,
    experience,
    education,
    skills,
    certifications,
    projects,
    languages,
    volunteer,
    awards,
    publications,
    references,
    hobbies,
    affiliations,
    courses,

    // Unmatched content
    unmatchedChunks,
    initUnmatchedChunks,
    skipUnmatchedChunk,
    addUnmatchedAs,

    // Actions
    updateContact,
    updateSummary,
    updateEntry,
    removeEntry,
    addEntry,
    swapPositionCompany,
    splitEntry,
    mergeEntries,
    reorderEntries,

    // Confidence
    getSectionConfidence,

    // Build
    buildPartialResumeData,
  };
}
