// =============================================================================
// Resume Builder - Contact Information Editor
// =============================================================================

import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  Link,
} from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input } from '@/components/ui';
import { contactSchema } from '@/schemas/contact';
import { useFieldValidation } from '@/hooks/useFieldValidation';

export function ContactEditor() {
  const contact = useResumeStore((s) => s.currentResume?.data.contact);
  const updateContact = useResumeStore((s) => s.updateContact);

  const { onBlur, getError } = useFieldValidation(contactSchema, (contact ?? {}) as Record<string, unknown>);

  if (!contact) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Add your personal and professional contact details.
        </p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          value={contact.firstName}
          onChange={(e) => updateContact({ firstName: e.target.value })}
          onBlur={() => onBlur('firstName')}
          error={getError('firstName')}
          icon={<User className="h-4 w-4" />}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={contact.lastName}
          onChange={(e) => updateContact({ lastName: e.target.value })}
          onBlur={() => onBlur('lastName')}
          error={getError('lastName')}
        />
      </div>

      {/* Title */}
      <Input
        label="Professional Title"
        placeholder="Senior Software Engineer"
        value={contact.title}
        onChange={(e) => updateContact({ title: e.target.value })}
        icon={<Briefcase className="h-4 w-4" />}
      />

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={contact.email}
          onChange={(e) => updateContact({ email: e.target.value })}
          onBlur={() => onBlur('email')}
          error={getError('email')}
          icon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={contact.phone}
          onChange={(e) => updateContact({ phone: e.target.value })}
          onBlur={() => onBlur('phone')}
          error={getError('phone')}
          icon={<Phone className="h-4 w-4" />}
        />
      </div>

      {/* Location & Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Location"
          placeholder="San Francisco, CA"
          value={contact.location}
          onChange={(e) => updateContact({ location: e.target.value })}
          icon={<MapPin className="h-4 w-4" />}
        />
        <Input
          label="Website"
          type="url"
          placeholder="https://johndoe.com"
          value={contact.website}
          onChange={(e) => updateContact({ website: e.target.value })}
          onBlur={() => onBlur('website')}
          error={getError('website')}
          icon={<Globe className="h-4 w-4" />}
        />
      </div>

      {/* LinkedIn & GitHub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="LinkedIn"
          placeholder="https://linkedin.com/in/johndoe"
          value={contact.linkedin}
          onChange={(e) => updateContact({ linkedin: e.target.value })}
          onBlur={() => onBlur('linkedin')}
          error={getError('linkedin')}
          icon={<Linkedin className="h-4 w-4" />}
        />
        <Input
          label="GitHub"
          placeholder="https://github.com/johndoe"
          value={contact.github}
          onChange={(e) => updateContact({ github: e.target.value })}
          onBlur={() => onBlur('github')}
          error={getError('github')}
          icon={<Github className="h-4 w-4" />}
        />
      </div>

      {/* Portfolio */}
      <Input
        label="Portfolio"
        placeholder="https://portfolio.johndoe.com"
        value={contact.portfolio}
        onChange={(e) => updateContact({ portfolio: e.target.value })}
        onBlur={() => onBlur('portfolio')}
        error={getError('portfolio')}
        icon={<Link className="h-4 w-4" />}
      />
    </div>
  );
}
