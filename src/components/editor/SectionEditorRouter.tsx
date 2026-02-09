// =============================================================================
// Resume Builder - Section Editor Router
// =============================================================================
// Renders the appropriate editor component based on the given sectionType.

import type { SectionType } from '@/types/resume';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ContactEditor } from './ContactEditor';
import { SummaryEditor } from './SummaryEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { EducationEditor } from './EducationEditor';
import { SkillsEditor } from './SkillsEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { CertificationsEditor } from './CertificationsEditor';
import { LanguagesEditor } from './LanguagesEditor';
import { VolunteerEditor } from './VolunteerEditor';
import { AwardsEditor } from './AwardsEditor';
import { PublicationsEditor } from './PublicationsEditor';
import { ReferencesEditor } from './ReferencesEditor';
import { HobbiesEditor } from './HobbiesEditor';
import { AffiliationsEditor } from './AffiliationsEditor';
import { CoursesEditor } from './CoursesEditor';
import { CustomSectionsEditor } from './CustomSectionsEditor';

interface SectionEditorRouterProps {
  sectionType: SectionType;
}

const editorMap: Record<SectionType, React.ComponentType> = {
  contact: ContactEditor,
  summary: SummaryEditor,
  experience: ExperienceEditor,
  education: EducationEditor,
  skills: SkillsEditor,
  projects: ProjectsEditor,
  certifications: CertificationsEditor,
  languages: LanguagesEditor,
  volunteer: VolunteerEditor,
  awards: AwardsEditor,
  publications: PublicationsEditor,
  references: ReferencesEditor,
  hobbies: HobbiesEditor,
  affiliations: AffiliationsEditor,
  courses: CoursesEditor,
  customSections: CustomSectionsEditor,
};

export function SectionEditorRouter({ sectionType }: SectionEditorRouterProps) {
  const EditorComponent = editorMap[sectionType];

  if (!EditorComponent) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Unknown section type: <code>{sectionType}</code>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackMessage={`Failed to load ${sectionType} editor`}>
      <EditorComponent />
    </ErrorBoundary>
  );
}
