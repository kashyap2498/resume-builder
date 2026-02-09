import type { CoverLetterData } from '@/types/coverLetter';
import type { ContactData } from '@/types/resume';

export function createDefaultCoverLetter(_contact: ContactData): CoverLetterData {
  const today = new Date();
  const formatted = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    date: formatted,
    salutation: 'Dear Hiring Manager,',
    openingParagraph: '',
    bodyParagraph: '',
    closingParagraph: '',
    signOff: 'Sincerely,',
  };
}
