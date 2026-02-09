import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResumeStore } from '@/store/resumeStore';
import { mockResume, mockResumeData, mockStyling } from '@/test/fixtures';
import type { Resume, SectionConfig, SkillCategory } from '@/types/resume';
import type { ResumeStyling } from '@/types/styling';

// ---------------------------------------------------------------------------
// Helper: deeply clone the mock resume so tests don't share mutable state
// ---------------------------------------------------------------------------
function freshResume(overrides?: Partial<Resume>): Resume {
  return structuredClone({ ...mockResume, ...overrides });
}

describe('resumeStore', () => {
  beforeEach(() => {
    useResumeStore.setState({ currentResume: null });
  });

  // =========================================================================
  // Resume-level actions
  // =========================================================================

  describe('setResume', () => {
    it('should set the current resume', () => {
      const resume = freshResume();
      useResumeStore.getState().setResume(resume);
      expect(useResumeStore.getState().currentResume).toEqual(resume);
    });

    it('should allow setting the resume to null', () => {
      useResumeStore.getState().setResume(freshResume());
      useResumeStore.getState().setResume(null);
      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  describe('setTemplateId', () => {
    it('should update templateId and refresh updatedAt', () => {
      const resume = freshResume();
      useResumeStore.getState().setResume(resume);
      const beforeTimestamp = useResumeStore.getState().currentResume!.updatedAt;

      useResumeStore.getState().setTemplateId('modern-pro');

      const state = useResumeStore.getState().currentResume!;
      expect(state.templateId).toBe('modern-pro');
      expect(state.updatedAt).not.toBe(beforeTimestamp);
    });

    it('should be a no-op when currentResume is null', () => {
      useResumeStore.getState().setTemplateId('modern-pro');
      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  describe('updateSections', () => {
    it('should replace the sections array', () => {
      useResumeStore.getState().setResume(freshResume());
      const newSections: SectionConfig[] = [
        { id: 'sec-1', type: 'contact', title: 'Contact Info', visible: true, order: 0 },
      ];
      useResumeStore.getState().updateSections(newSections);
      expect(useResumeStore.getState().currentResume!.sections).toEqual(newSections);
    });
  });

  describe('updateStyling', () => {
    it('should replace the styling object', () => {
      useResumeStore.getState().setResume(freshResume());
      const newStyling: ResumeStyling = {
        ...mockStyling,
        themeId: 'dark-mode',
      };
      useResumeStore.getState().updateStyling(newStyling);
      expect(useResumeStore.getState().currentResume!.styling.themeId).toBe('dark-mode');
    });
  });

  // =========================================================================
  // Contact & Summary
  // =========================================================================

  describe('updateContact', () => {
    it('should partially merge contact data', () => {
      useResumeStore.getState().setResume(freshResume());
      useResumeStore.getState().updateContact({ firstName: 'Jane', email: 'jane@example.com' });

      const contact = useResumeStore.getState().currentResume!.data.contact;
      expect(contact.firstName).toBe('Jane');
      expect(contact.email).toBe('jane@example.com');
      // Other fields unchanged
      expect(contact.lastName).toBe('Doe');
      expect(contact.phone).toBe('555-123-4567');
    });

    it('should be a no-op when currentResume is null', () => {
      useResumeStore.getState().updateContact({ firstName: 'Jane' });
      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  describe('updateSummary', () => {
    it('should partially merge summary data', () => {
      useResumeStore.getState().setResume(freshResume());
      useResumeStore.getState().updateSummary({ text: 'New summary text' });

      expect(useResumeStore.getState().currentResume!.data.summary.text).toBe('New summary text');
    });
  });

  // =========================================================================
  // Experience CRUD
  // =========================================================================

  describe('experience CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addExperience should append a new entry with a generated id', () => {
      const before = useResumeStore.getState().currentResume!.data.experience.length;
      useResumeStore.getState().addExperience({
        company: 'New Corp',
        position: 'Intern',
        location: 'Remote',
        startDate: '2024',
        endDate: '',
        current: true,
        description: 'Internship',
        highlights: [],
      });
      const experience = useResumeStore.getState().currentResume!.data.experience;
      expect(experience).toHaveLength(before + 1);
      const added = experience[experience.length - 1];
      expect(added.company).toBe('New Corp');
      expect(added.id).toBeDefined();
      expect(added.id).not.toBe('');
    });

    it('updateExperience should partially update the matching entry', () => {
      useResumeStore.getState().updateExperience('exp-1', { position: 'Lead Developer' });
      const entry = useResumeStore.getState().currentResume!.data.experience.find(
        (e) => e.id === 'exp-1',
      );
      expect(entry!.position).toBe('Lead Developer');
      expect(entry!.company).toBe('Tech Corp'); // unchanged
    });

    it('removeExperience should remove the matching entry', () => {
      useResumeStore.getState().removeExperience('exp-1');
      const experience = useResumeStore.getState().currentResume!.data.experience;
      expect(experience.find((e) => e.id === 'exp-1')).toBeUndefined();
      expect(experience).toHaveLength(1);
    });

    it('reorderExperience should reorder entries by id list', () => {
      useResumeStore.getState().reorderExperience(['exp-2', 'exp-1']);
      const ids = useResumeStore.getState().currentResume!.data.experience.map((e) => e.id);
      expect(ids).toEqual(['exp-2', 'exp-1']);
    });
  });

  // =========================================================================
  // Education CRUD
  // =========================================================================

  describe('education CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addEducation should append a new entry', () => {
      useResumeStore.getState().addEducation({
        institution: 'Stanford',
        degree: 'MS',
        field: 'AI',
        startDate: '2020',
        endDate: '2022',
        gpa: '4.0',
        description: '',
        highlights: [],
      });
      const education = useResumeStore.getState().currentResume!.data.education;
      expect(education).toHaveLength(2);
      expect(education[1].institution).toBe('Stanford');
      expect(education[1].id).toBeDefined();
    });

    it('updateEducation should partially update', () => {
      useResumeStore.getState().updateEducation('edu-1', { gpa: '3.9' });
      const entry = useResumeStore.getState().currentResume!.data.education.find(
        (e) => e.id === 'edu-1',
      );
      expect(entry!.gpa).toBe('3.9');
      expect(entry!.institution).toBe('MIT');
    });

    it('removeEducation should remove entry', () => {
      useResumeStore.getState().removeEducation('edu-1');
      expect(useResumeStore.getState().currentResume!.data.education).toHaveLength(0);
    });

    it('reorderEducation should reorder entries', () => {
      // Add a second education so we can reorder
      useResumeStore.getState().addEducation({
        institution: 'Harvard',
        degree: 'MBA',
        field: 'Business',
        startDate: '2018',
        endDate: '2020',
        gpa: '3.7',
        description: '',
        highlights: [],
      });
      const education = useResumeStore.getState().currentResume!.data.education;
      const ids = education.map((e) => e.id);
      useResumeStore.getState().reorderEducation([ids[1], ids[0]]);
      const reordered = useResumeStore.getState().currentResume!.data.education.map((e) => e.id);
      expect(reordered).toEqual([ids[1], ids[0]]);
    });
  });

  // =========================================================================
  // Skills
  // =========================================================================

  describe('updateSkills', () => {
    it('should replace the skills array', () => {
      useResumeStore.getState().setResume(freshResume());
      const newSkills: SkillCategory[] = [
        { id: 'sk-1', category: 'DevOps', items: [{ name: 'Docker', proficiency: 4 }] },
      ];
      useResumeStore.getState().updateSkills(newSkills);
      expect(useResumeStore.getState().currentResume!.data.skills).toEqual(newSkills);
    });
  });

  // =========================================================================
  // Projects CRUD
  // =========================================================================

  describe('projects CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addProject should append a project', () => {
      useResumeStore.getState().addProject({
        name: 'CLI Tool',
        description: 'A CLI',
        technologies: ['Rust'],
        url: '',
        startDate: '2024',
        endDate: '2024',
        highlights: [],
      });
      const projects = useResumeStore.getState().currentResume!.data.projects;
      expect(projects).toHaveLength(2);
      expect(projects[1].name).toBe('CLI Tool');
    });

    it('updateProject should partially update', () => {
      useResumeStore.getState().updateProject('proj-1', { name: 'Updated Project' });
      expect(
        useResumeStore.getState().currentResume!.data.projects.find((p) => p.id === 'proj-1')!
          .name,
      ).toBe('Updated Project');
    });

    it('removeProject should remove entry', () => {
      useResumeStore.getState().removeProject('proj-1');
      expect(useResumeStore.getState().currentResume!.data.projects).toHaveLength(0);
    });

    it('reorderProjects should reorder entries', () => {
      useResumeStore.getState().addProject({
        name: 'Second',
        description: '',
        technologies: [],
        url: '',
        startDate: '',
        endDate: '',
        highlights: [],
      });
      const projects = useResumeStore.getState().currentResume!.data.projects;
      const ids = projects.map((p) => p.id);
      useResumeStore.getState().reorderProjects([ids[1], ids[0]]);
      const reordered = useResumeStore.getState().currentResume!.data.projects.map((p) => p.id);
      expect(reordered).toEqual([ids[1], ids[0]]);
    });
  });

  // =========================================================================
  // Certifications CRUD
  // =========================================================================

  describe('certifications CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addCertification should append a certification', () => {
      useResumeStore.getState().addCertification({
        name: 'GCP Professional',
        issuer: 'Google',
        date: '2024',
        expiryDate: '2027',
        credentialId: 'XYZ',
        url: '',
      });
      expect(useResumeStore.getState().currentResume!.data.certifications).toHaveLength(2);
    });

    it('updateCertification should partially update', () => {
      useResumeStore.getState().updateCertification('cert-1', { issuer: 'AWS' });
      expect(
        useResumeStore.getState().currentResume!.data.certifications.find(
          (c) => c.id === 'cert-1',
        )!.issuer,
      ).toBe('AWS');
    });

    it('removeCertification should remove entry', () => {
      useResumeStore.getState().removeCertification('cert-1');
      expect(useResumeStore.getState().currentResume!.data.certifications).toHaveLength(0);
    });

    it('reorderCertifications should reorder', () => {
      useResumeStore.getState().addCertification({
        name: 'Azure',
        issuer: 'Microsoft',
        date: '2024',
        expiryDate: '',
        credentialId: '',
        url: '',
      });
      const certs = useResumeStore.getState().currentResume!.data.certifications;
      const ids = certs.map((c) => c.id);
      useResumeStore.getState().reorderCertifications([ids[1], ids[0]]);
      const reordered = useResumeStore
        .getState()
        .currentResume!.data.certifications.map((c) => c.id);
      expect(reordered).toEqual([ids[1], ids[0]]);
    });
  });

  // =========================================================================
  // Languages CRUD
  // =========================================================================

  describe('languages CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addLanguage should append a language', () => {
      useResumeStore.getState().addLanguage({ name: 'French', proficiency: 'beginner' });
      expect(useResumeStore.getState().currentResume!.data.languages).toHaveLength(3);
    });

    it('updateLanguage should partially update', () => {
      useResumeStore.getState().updateLanguage('lang-2', { proficiency: 'advanced' });
      expect(
        useResumeStore.getState().currentResume!.data.languages.find((l) => l.id === 'lang-2')!
          .proficiency,
      ).toBe('advanced');
    });

    it('removeLanguage should remove entry', () => {
      useResumeStore.getState().removeLanguage('lang-1');
      const languages = useResumeStore.getState().currentResume!.data.languages;
      expect(languages).toHaveLength(1);
      expect(languages[0].id).toBe('lang-2');
    });
  });

  // =========================================================================
  // Volunteer CRUD
  // =========================================================================

  describe('volunteer CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addVolunteer should append', () => {
      useResumeStore.getState().addVolunteer({
        organization: 'Red Cross',
        role: 'Helper',
        startDate: '2023',
        endDate: '',
        description: '',
        highlights: [],
      });
      expect(useResumeStore.getState().currentResume!.data.volunteer).toHaveLength(2);
    });

    it('updateVolunteer should partially update', () => {
      useResumeStore.getState().updateVolunteer('vol-1', { role: 'Lead Mentor' });
      expect(
        useResumeStore.getState().currentResume!.data.volunteer.find((v) => v.id === 'vol-1')!
          .role,
      ).toBe('Lead Mentor');
    });

    it('removeVolunteer should remove', () => {
      useResumeStore.getState().removeVolunteer('vol-1');
      expect(useResumeStore.getState().currentResume!.data.volunteer).toHaveLength(0);
    });
  });

  // =========================================================================
  // Awards CRUD
  // =========================================================================

  describe('awards CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addAward should append', () => {
      useResumeStore.getState().addAward({
        title: 'Employee of Year',
        issuer: 'Corp',
        date: '2023',
        description: '',
      });
      expect(useResumeStore.getState().currentResume!.data.awards).toHaveLength(2);
    });

    it('updateAward should partially update', () => {
      useResumeStore.getState().updateAward('award-1', { title: 'Top Innovation Award' });
      expect(
        useResumeStore.getState().currentResume!.data.awards.find((a) => a.id === 'award-1')!
          .title,
      ).toBe('Top Innovation Award');
    });

    it('removeAward should remove', () => {
      useResumeStore.getState().removeAward('award-1');
      expect(useResumeStore.getState().currentResume!.data.awards).toHaveLength(0);
    });
  });

  // =========================================================================
  // Publications CRUD
  // =========================================================================

  describe('publications CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addPublication should append', () => {
      useResumeStore.getState().addPublication({
        title: 'New Paper',
        publisher: 'IEEE',
        date: '2024',
        url: '',
        description: '',
      });
      expect(useResumeStore.getState().currentResume!.data.publications).toHaveLength(2);
    });

    it('updatePublication should partially update', () => {
      useResumeStore.getState().updatePublication('pub-1', { publisher: 'ACM' });
      expect(
        useResumeStore.getState().currentResume!.data.publications.find((p) => p.id === 'pub-1')!
          .publisher,
      ).toBe('ACM');
    });

    it('removePublication should remove', () => {
      useResumeStore.getState().removePublication('pub-1');
      expect(useResumeStore.getState().currentResume!.data.publications).toHaveLength(0);
    });
  });

  // =========================================================================
  // References CRUD
  // =========================================================================

  describe('references CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addReference should append', () => {
      useResumeStore.getState().addReference({
        name: 'Alice Smith',
        title: 'CTO',
        company: 'TechCo',
        email: 'alice@tech.co',
        phone: '555-0000',
        relationship: 'Manager',
      });
      expect(useResumeStore.getState().currentResume!.data.references).toHaveLength(1);
    });

    it('updateReference should partially update', () => {
      useResumeStore.getState().addReference({
        name: 'Bob',
        title: 'VP',
        company: 'X',
        email: '',
        phone: '',
        relationship: '',
      });
      const id = useResumeStore.getState().currentResume!.data.references[0].id;
      useResumeStore.getState().updateReference(id, { name: 'Bob Jones' });
      expect(
        useResumeStore.getState().currentResume!.data.references.find((r) => r.id === id)!.name,
      ).toBe('Bob Jones');
    });

    it('removeReference should remove', () => {
      useResumeStore.getState().addReference({
        name: 'Charlie',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
      });
      const id = useResumeStore.getState().currentResume!.data.references[0].id;
      useResumeStore.getState().removeReference(id);
      expect(useResumeStore.getState().currentResume!.data.references).toHaveLength(0);
    });
  });

  // =========================================================================
  // Hobbies
  // =========================================================================

  describe('updateHobbies', () => {
    it('should replace the hobbies data', () => {
      useResumeStore.getState().setResume(freshResume());
      useResumeStore.getState().updateHobbies({ items: ['Gaming', 'Cooking'] });
      expect(useResumeStore.getState().currentResume!.data.hobbies.items).toEqual([
        'Gaming',
        'Cooking',
      ]);
    });
  });

  // =========================================================================
  // Affiliations CRUD
  // =========================================================================

  describe('affiliations CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addAffiliation should append', () => {
      useResumeStore.getState().addAffiliation({
        organization: 'ACM',
        role: 'Member',
        startDate: '2020',
        endDate: '',
      });
      expect(useResumeStore.getState().currentResume!.data.affiliations).toHaveLength(1);
    });

    it('updateAffiliation should partially update', () => {
      useResumeStore.getState().addAffiliation({
        organization: 'IEEE',
        role: 'Student Member',
        startDate: '2019',
        endDate: '',
      });
      const id = useResumeStore.getState().currentResume!.data.affiliations[0].id;
      useResumeStore.getState().updateAffiliation(id, { role: 'Senior Member' });
      expect(
        useResumeStore.getState().currentResume!.data.affiliations.find((a) => a.id === id)!.role,
      ).toBe('Senior Member');
    });

    it('removeAffiliation should remove', () => {
      useResumeStore.getState().addAffiliation({
        organization: 'ACM',
        role: 'Member',
        startDate: '2020',
        endDate: '',
      });
      const id = useResumeStore.getState().currentResume!.data.affiliations[0].id;
      useResumeStore.getState().removeAffiliation(id);
      expect(useResumeStore.getState().currentResume!.data.affiliations).toHaveLength(0);
    });
  });

  // =========================================================================
  // Courses CRUD
  // =========================================================================

  describe('courses CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addCourse should append', () => {
      useResumeStore.getState().addCourse({
        name: 'Machine Learning',
        institution: 'Coursera',
        completionDate: '2024',
        description: 'ML course',
      });
      expect(useResumeStore.getState().currentResume!.data.courses).toHaveLength(1);
    });

    it('updateCourse should partially update', () => {
      useResumeStore.getState().addCourse({
        name: 'Deep Learning',
        institution: 'Udacity',
        completionDate: '2024',
        description: '',
      });
      const id = useResumeStore.getState().currentResume!.data.courses[0].id;
      useResumeStore.getState().updateCourse(id, { name: 'Advanced Deep Learning' });
      expect(
        useResumeStore.getState().currentResume!.data.courses.find((c) => c.id === id)!.name,
      ).toBe('Advanced Deep Learning');
    });

    it('removeCourse should remove', () => {
      useResumeStore.getState().addCourse({
        name: 'Stats',
        institution: 'edX',
        completionDate: '2023',
        description: '',
      });
      const id = useResumeStore.getState().currentResume!.data.courses[0].id;
      useResumeStore.getState().removeCourse(id);
      expect(useResumeStore.getState().currentResume!.data.courses).toHaveLength(0);
    });
  });

  // =========================================================================
  // Custom Sections CRUD
  // =========================================================================

  describe('custom sections CRUD', () => {
    beforeEach(() => {
      useResumeStore.getState().setResume(freshResume());
    });

    it('addCustomSection should append', () => {
      useResumeStore.getState().addCustomSection({
        title: 'Side Projects',
        entries: [],
      });
      expect(useResumeStore.getState().currentResume!.data.customSections).toHaveLength(1);
      expect(
        useResumeStore.getState().currentResume!.data.customSections[0].title,
      ).toBe('Side Projects');
    });

    it('updateCustomSection should partially update', () => {
      useResumeStore.getState().addCustomSection({ title: 'Custom', entries: [] });
      const id = useResumeStore.getState().currentResume!.data.customSections[0].id;
      useResumeStore.getState().updateCustomSection(id, { title: 'Updated Custom' });
      expect(
        useResumeStore.getState().currentResume!.data.customSections.find((s) => s.id === id)!
          .title,
      ).toBe('Updated Custom');
    });

    it('removeCustomSection should remove', () => {
      useResumeStore.getState().addCustomSection({ title: 'Temp', entries: [] });
      const id = useResumeStore.getState().currentResume!.data.customSections[0].id;
      useResumeStore.getState().removeCustomSection(id);
      expect(useResumeStore.getState().currentResume!.data.customSections).toHaveLength(0);
    });
  });

  // =========================================================================
  // Mutate helper guards (null resume)
  // =========================================================================

  describe('mutate guard (null resume)', () => {
    it('all mutating actions should be no-ops when currentResume is null', () => {
      // Verify the store starts with null
      expect(useResumeStore.getState().currentResume).toBeNull();

      // Call a variety of mutating actions — none should throw or change state
      const actions = useResumeStore.getState();
      actions.setTemplateId('x');
      actions.updateSections([]);
      actions.updateStyling(mockStyling);
      actions.updateContact({ firstName: 'X' });
      actions.updateSummary({ text: 'X' });
      actions.addExperience({
        company: 'X',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: [],
      });
      actions.updateSkills([]);
      actions.updateHobbies({ items: [] });

      expect(useResumeStore.getState().currentResume).toBeNull();
    });
  });

  // =========================================================================
  // updatedAt timestamp
  // =========================================================================

  describe('updatedAt timestamp', () => {
    it('should be refreshed on every mutation', async () => {
      useResumeStore.getState().setResume(freshResume());
      const ts1 = useResumeStore.getState().currentResume!.updatedAt;

      // Small delay to guarantee a different ISO timestamp
      await new Promise((r) => setTimeout(r, 5));

      useResumeStore.getState().updateContact({ firstName: 'Updated' });
      const ts2 = useResumeStore.getState().currentResume!.updatedAt;

      expect(ts2).not.toBe(ts1);
      expect(new Date(ts2).getTime()).toBeGreaterThan(new Date(ts1).getTime());
    });
  });
});
