import { useState, useCallback, useMemo, useRef } from 'react';
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
import { extractSectionContent } from '@/utils/resumeParser';

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

interface ReviewSnapshot {
  contact: ContactData;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  languages: LanguageEntry[];
  volunteer: VolunteerEntry[];
  awards: AwardEntry[];
  publications: PublicationEntry[];
  references: ReferenceEntry[];
  hobbies: HobbiesData;
  affiliations: AffiliationEntry[];
  courses: CourseEntry[];
  unmatchedChunks: Array<{ text: string; startOffset: number; endOffset: number }>;
}

const MAX_HISTORY = 50;

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

  // -- Undo/Redo history ------------------------------------------------------

  const pastRef = useRef<ReviewSnapshot[]>([]);
  const futureRef = useRef<ReviewSnapshot[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);

  const takeSnapshot = useCallback((): ReviewSnapshot => ({
    contact, summary, experience, education, skills, certifications,
    projects, languages, volunteer, awards, publications, references,
    hobbies, affiliations, courses, unmatchedChunks,
  }), [
    contact, summary, experience, education, skills, certifications,
    projects, languages, volunteer, awards, publications, references,
    hobbies, affiliations, courses, unmatchedChunks,
  ]);

  const restoreSnapshot = useCallback((snap: ReviewSnapshot) => {
    setContact(snap.contact);
    setSummary(snap.summary);
    setExperience(snap.experience);
    setEducation(snap.education);
    setSkills(snap.skills);
    setCertifications(snap.certifications);
    setProjects(snap.projects);
    setLanguages(snap.languages);
    setVolunteer(snap.volunteer);
    setAwards(snap.awards);
    setPublications(snap.publications);
    setReferences(snap.references);
    setHobbies(snap.hobbies);
    setAffiliations(snap.affiliations);
    setCourses(snap.courses);
    setUnmatchedChunks(snap.unmatchedChunks);
  }, []);

  const pushHistory = useCallback(() => {
    const snap = takeSnapshot();
    pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snap];
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, [takeSnapshot]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const snap = takeSnapshot();
    futureRef.current = [...futureRef.current, snap];
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    restoreSnapshot(prev);
    setHistoryVersion((v) => v + 1);
  }, [takeSnapshot, restoreSnapshot]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const snap = takeSnapshot();
    pastRef.current = [...pastRef.current, snap];
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    restoreSnapshot(next);
    setHistoryVersion((v) => v + 1);
  }, [takeSnapshot, restoreSnapshot]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  // Force re-read of canUndo/canRedo when history changes
  void historyVersion;

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

  // -- Unmatched content actions ---------------------------------------------

  const skipUnmatchedChunk = useCallback((index: number) => {
    pushHistory();
    setUnmatchedChunks((prev) => prev.filter((_, i) => i !== index));
  }, [pushHistory]);

  const addUnmatchedAs = useCallback((chunkIndex: number, sectionType: string) => {
    const chunk = unmatchedChunks[chunkIndex];
    if (!chunk) return;

    const extracted = extractSectionContent(sectionType, chunk.text);
    if (!extracted) {
      pushHistory();
      setUnmatchedChunks((prev) => prev.filter((_, i) => i !== chunkIndex));
      return;
    }

    pushHistory();

    // Handle hobbies/interests as a special case (not in sectionStateMap)
    if (sectionType === 'interests' || sectionType === 'hobbies') {
      const data = extracted as { items: string[] };
      if (data.items?.length > 0) {
        setHobbies((prev) => ({
          items: [...prev.items, ...data.items],
        }));
      }
    } else if (sectionType === 'summary') {
      const data = extracted as { text: string };
      if (data.text) {
        setSummary((prev) => (prev ? prev + '\n' + data.text : data.text));
      }
    } else {
      // Array sections: append extracted entries
      const s = sectionStateMap[sectionType as ArraySection];
      if (s) {
        const entries = extracted as ArrayEntry[];
        if (Array.isArray(entries) && entries.length > 0) {
          s.set((prev) => [...prev, ...entries]);
        }
      }
    }

    setUnmatchedChunks((prev) => prev.filter((_, i) => i !== chunkIndex));
  }, [unmatchedChunks, sectionStateMap, pushHistory]);

  // -- Actions ---------------------------------------------------------------

  const updateContact = useCallback(
    (field: keyof ContactData, value: string) => {
      pushHistory();
      setContact((prev) => ({ ...prev, [field]: value }));
    },
    [pushHistory],
  );

  const updateSummary = useCallback((text: string) => {
    pushHistory();
    setSummary(text);
  }, [pushHistory]);

  const updateEntry = useCallback(
    (section: string, index: number, updates: Record<string, unknown>) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      pushHistory();
      s.set((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    [sectionStateMap, pushHistory],
  );

  const removeEntry = useCallback(
    (section: string, index: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      pushHistory();
      s.set((prev) => prev.filter((_, i) => i !== index));
    },
    [sectionStateMap, pushHistory],
  );

  const addEntry = useCallback(
    (section: string, entry: unknown) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      pushHistory();
      s.set((prev) => [...prev, entry as ArrayEntry]);
    },
    [sectionStateMap, pushHistory],
  );

  const swapPositionCompany = useCallback(
    (index: number) => {
      pushHistory();
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
    [pushHistory],
  );

  const splitEntry = useCallback(
    (entryIndex: number, bulletIndex: number) => {
      pushHistory();
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
    [pushHistory],
  );

  const mergeEntries = useCallback(
    (section: string, indexA: number, indexB: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      pushHistory();

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
    [sectionStateMap, pushHistory],
  );

  const reorderEntries = useCallback(
    (section: string, fromIndex: number, toIndex: number) => {
      const s = sectionStateMap[section as ArraySection];
      if (!s) return;
      pushHistory();
      s.set((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [sectionStateMap, pushHistory],
  );

  // -- Bullet-level actions (experience only) ---------------------------------

  const updateBullet = useCallback(
    (entryIndex: number, bulletIndex: number, text: string) => {
      pushHistory();
      setExperience((prev) => {
        const next = [...prev];
        const entry = { ...next[entryIndex] };
        const highlights = [...entry.highlights];
        highlights[bulletIndex] = text;
        entry.highlights = highlights;
        next[entryIndex] = entry;
        return next;
      });
    },
    [pushHistory],
  );

  const removeBullet = useCallback(
    (entryIndex: number, bulletIndex: number) => {
      pushHistory();
      setExperience((prev) => {
        const next = [...prev];
        const entry = { ...next[entryIndex] };
        entry.highlights = entry.highlights.filter((_, i) => i !== bulletIndex);
        next[entryIndex] = entry;
        return next;
      });
    },
    [pushHistory],
  );

  const addBullet = useCallback(
    (entryIndex: number, text: string = '') => {
      pushHistory();
      setExperience((prev) => {
        const next = [...prev];
        const entry = { ...next[entryIndex] };
        entry.highlights = [...entry.highlights, text];
        next[entryIndex] = entry;
        return next;
      });
    },
    [pushHistory],
  );

  const reorderBullet = useCallback(
    (entryIndex: number, fromIndex: number, toIndex: number) => {
      pushHistory();
      setExperience((prev) => {
        const next = [...prev];
        const entry = { ...next[entryIndex] };
        const highlights = [...entry.highlights];
        const [moved] = highlights.splice(fromIndex, 1);
        highlights.splice(toIndex, 0, moved);
        entry.highlights = highlights;
        next[entryIndex] = entry;
        return next;
      });
    },
    [pushHistory],
  );

  const moveBullet = useCallback(
    (fromEntryIndex: number, bulletIndex: number, toEntryIndex: number) => {
      pushHistory();
      setExperience((prev) => {
        const next = [...prev];
        const fromEntry = { ...next[fromEntryIndex] };
        const toEntry = { ...next[toEntryIndex] };
        const bullet = fromEntry.highlights[bulletIndex];
        fromEntry.highlights = fromEntry.highlights.filter((_, i) => i !== bulletIndex);
        toEntry.highlights = [...toEntry.highlights, bullet];
        next[fromEntryIndex] = fromEntry;
        next[toEntryIndex] = toEntry;
        return next;
      });
    },
    [pushHistory],
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
          if (education.some((e) => {
            if (!e.institution || /^[,\s]/.test(e.institution)) return true;
            // Detect garbled: institution starts with degree keyword
            if (/^(?:Bachelor|Master|Doctor|Ph\.?D|B\.?S|B\.?A|M\.?S|M\.?A|M\.?B\.?A|Associate)/i.test(e.institution)) return true;
            // Detect garbled: institution matches degree text
            if (e.degree && e.institution === e.degree) return true;
            return false;
          })) return 'incomplete';
          return education.every((e) => e.institution)
            ? 'complete'
            : 'incomplete';

        case 'skills': {
          if (skills.length === 0) return 'empty';
          // Check for fragmentation: any item < 5 chars or average length < 10
          const allItems = skills.flatMap((s) => s.items);
          if (allItems.length === 0) return 'empty';
          const hasShortItems = allItems.some((item) => item.length < 5);
          const avgLen = allItems.reduce((sum, item) => sum + item.length, 0) / allItems.length;
          if (hasShortItems || avgLen < 10) return 'incomplete';
          return 'complete';
        }

        case 'projects':
          if (projects.length === 0) return 'empty';
          return projects.every((p) => p.name) ? 'complete' : 'incomplete';

        case 'certifications': {
          if (certifications.length === 0) return 'empty';
          // Check for placeholder credential IDs, URLs, and issuers
          const PLACEHOLDER_ID_RE = /^(?:ABC123|XYZ789|123456|PLACEHOLDER|N\/A|TBD|NA)$/i;
          const PLACEHOLDER_URL_RE = /^https?:\/\/(?:\.{3}|example\.com|placeholder)\/?$/i;
          const PLACEHOLDER_ISSUER_RE = /^(?:issuing\s*organization|organization|issuer|n\/a|tbd)$/i;
          if (certifications.some((c) =>
            (c.credentialId && PLACEHOLDER_ID_RE.test(c.credentialId.trim())) ||
            (c.url && PLACEHOLDER_URL_RE.test(c.url.trim())) ||
            (c.issuer && PLACEHOLDER_ISSUER_RE.test(c.issuer.trim()))
          )) return 'incomplete';
          return certifications.every((c) => c.name)
            ? 'complete'
            : 'incomplete';
        }

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

    // Setters
    setHobbies,

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

    // Bullet actions
    updateBullet,
    removeBullet,
    addBullet,
    reorderBullet,
    moveBullet,

    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,

    // Confidence
    getSectionConfidence,

    // Build
    buildPartialResumeData,
  };
}
