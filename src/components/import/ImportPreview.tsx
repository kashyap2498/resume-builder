// =============================================================================
// Resume Builder - Import Preview Component
// =============================================================================
// After parsing a PDF/DOCX file, shows the extracted data in a preview form.
// The user can review and edit the parsed fields before confirming the import.

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, TextArea } from '@/components/ui';
import type { ResumeData, CertificationEntry } from '@/types/resume';

interface ImportPreviewProps {
  parsedData: Partial<ResumeData>;
  onApply: (data: Partial<ResumeData>) => void;
  onCancel: () => void;
}

export function ImportPreview({
  parsedData,
  onApply,
  onCancel,
}: ImportPreviewProps) {
  // Editable local state derived from parsed data
  const [contact, setContact] = useState({
    firstName: parsedData.contact?.firstName ?? '',
    lastName: parsedData.contact?.lastName ?? '',
    email: parsedData.contact?.email ?? '',
    phone: parsedData.contact?.phone ?? '',
    location: parsedData.contact?.location ?? '',
    title: parsedData.contact?.title ?? '',
    linkedin: parsedData.contact?.linkedin ?? '',
    github: parsedData.contact?.github ?? '',
    website: parsedData.contact?.website ?? '',
    portfolio: parsedData.contact?.portfolio ?? '',
  });

  const [summary, setSummary] = useState(parsedData.summary?.text ?? '');

  const [experience, setExperience] = useState(
    parsedData.experience?.map((exp) => ({
      ...exp,
      highlights: [...exp.highlights],
    })) ?? []
  );

  const [education, setEducation] = useState(
    parsedData.education?.map((edu) => ({
      ...edu,
      highlights: [...edu.highlights],
    })) ?? []
  );

  const [skills, setSkills] = useState(
    parsedData.skills?.map((cat) => ({
      ...cat,
      items: [...cat.items],
    })) ?? []
  );

  const [certifications, setCertifications] = useState(
    parsedData.certifications?.map((cert) => ({ ...cert })) ?? []
  );

  const hasAnyData =
    contact.firstName.trim() !== '' ||
    contact.lastName.trim() !== '' ||
    contact.email.trim() !== '' ||
    contact.phone.trim() !== '' ||
    summary.trim() !== '' ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0 ||
    certifications.length > 0;

  const handleApply = () => {
    const data: Partial<ResumeData> = {};

    // Only include sections that have actual data
    const hasContact = Object.values(contact).some((v) => v.trim() !== '');
    if (hasContact) data.contact = { ...contact };
    if (summary.trim()) data.summary = { text: summary };
    if (experience.length > 0) data.experience = experience;
    if (education.length > 0) data.education = education;
    if (skills.length > 0) data.skills = skills;
    if (certifications.length > 0) data.certifications = certifications;

    onApply(data);
  };

  return (
    <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
      {!hasAnyData && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No data could be extracted from this file. The file may be image-based or in an unsupported format. You can fill in the fields manually below.
        </div>
      )}
      {/* Contact Info */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={contact.firstName}
            onChange={(e) =>
              setContact((c) => ({ ...c, firstName: e.target.value }))
            }
          />
          <Input
            label="Last Name"
            value={contact.lastName}
            onChange={(e) =>
              setContact((c) => ({ ...c, lastName: e.target.value }))
            }
          />
          <Input
            label="Email"
            value={contact.email}
            onChange={(e) =>
              setContact((c) => ({ ...c, email: e.target.value }))
            }
          />
          <Input
            label="Phone"
            value={contact.phone}
            onChange={(e) =>
              setContact((c) => ({ ...c, phone: e.target.value }))
            }
          />
          <Input
            label="Location"
            value={contact.location}
            onChange={(e) =>
              setContact((c) => ({ ...c, location: e.target.value }))
            }
          />
          <Input
            label="Title"
            value={contact.title}
            onChange={(e) =>
              setContact((c) => ({ ...c, title: e.target.value }))
            }
          />
          <Input
            label="LinkedIn"
            value={contact.linkedin}
            onChange={(e) =>
              setContact((c) => ({ ...c, linkedin: e.target.value }))
            }
          />
          <Input
            label="GitHub"
            value={contact.github}
            onChange={(e) =>
              setContact((c) => ({ ...c, github: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Summary */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Professional Summary
        </h3>
        <TextArea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Professional summary..."
        />
      </section>

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Experience ({experience.length})
          </h3>
          <div className="space-y-4">
            {experience.map((exp, expIdx) => (
              <div
                key={exp.id}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExperience((prev) =>
                      prev.filter((_, i) => i !== expIdx)
                    )
                  }
                  className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Remove experience entry"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Position"
                    value={exp.position}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((item, i) =>
                          i === expIdx
                            ? { ...item, position: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((item, i) =>
                          i === expIdx
                            ? { ...item, company: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Start Date"
                    value={exp.startDate}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((item, i) =>
                          i === expIdx
                            ? { ...item, startDate: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="End Date"
                    value={exp.endDate}
                    onChange={(e) =>
                      setExperience((prev) =>
                        prev.map((item, i) =>
                          i === expIdx
                            ? { ...item, endDate: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                </div>
                {exp.highlights.length > 0 && (
                  <div className="mt-3">
                    <label className="text-xs font-medium text-gray-600">
                      Highlights
                    </label>
                    <ul className="mt-1 space-y-1">
                      {exp.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) =>
                              setExperience((prev) =>
                                prev.map((item, i) =>
                                  i === expIdx
                                    ? {
                                        ...item,
                                        highlights: item.highlights.map(
                                          (h, hi) =>
                                            hi === hIdx
                                              ? e.target.value
                                              : h
                                        ),
                                      }
                                    : item
                                )
                              )
                            }
                            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Education ({education.length})
          </h3>
          <div className="space-y-4">
            {education.map((edu, eduIdx) => (
              <div
                key={edu.id}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setEducation((prev) =>
                      prev.filter((_, i) => i !== eduIdx)
                    )
                  }
                  className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Remove education entry"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((item, i) =>
                          i === eduIdx
                            ? { ...item, institution: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((item, i) =>
                          i === eduIdx
                            ? { ...item, degree: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Field of Study"
                    value={edu.field}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((item, i) =>
                          i === eduIdx
                            ? { ...item, field: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="GPA"
                    value={edu.gpa}
                    onChange={(e) =>
                      setEducation((prev) =>
                        prev.map((item, i) =>
                          i === eduIdx
                            ? { ...item, gpa: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Skills ({skills.reduce((acc, cat) => acc + cat.items.length, 0)})
          </h3>
          <div className="space-y-3">
            {skills.map((cat, catIdx) => (
              <div
                key={cat.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <Input
                  label="Category"
                  value={cat.category}
                  onChange={(e) =>
                    setSkills((prev) =>
                      prev.map((item, i) =>
                        i === catIdx
                          ? { ...item, category: e.target.value }
                          : item
                      )
                    )
                  }
                  wrapperClassName="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((skill, skillIdx) => (
                    <div
                      key={skillIdx}
                      className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs border border-gray-200"
                    >
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) =>
                          setSkills((prev) =>
                            prev.map((c, ci) =>
                              ci === catIdx
                                ? {
                                    ...c,
                                    items: c.items.map((s, si) =>
                                      si === skillIdx
                                        ? { ...s, name: e.target.value }
                                        : s
                                    ),
                                  }
                                : c
                            )
                          )
                        }
                        className="w-20 border-none bg-transparent text-xs text-gray-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSkills((prev) =>
                            prev.map((c, ci) =>
                              ci === catIdx
                                ? {
                                    ...c,
                                    items: c.items.filter(
                                      (_, si) => si !== skillIdx
                                    ),
                                  }
                                : c
                            )
                          )
                        }
                        className="text-gray-500 hover:text-red-500"
                        aria-label="Remove skill"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Certifications ({certifications.length})
          </h3>
          <div className="space-y-4">
            {certifications.map((cert, certIdx) => (
              <div
                key={cert.id}
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCertifications((prev) =>
                      prev.filter((_, i) => i !== certIdx)
                    )
                  }
                  className="absolute right-2 top-2 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Remove certification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Name"
                    value={cert.name}
                    onChange={(e) =>
                      setCertifications((prev) =>
                        prev.map((item, i) =>
                          i === certIdx
                            ? { ...item, name: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Issuer"
                    value={cert.issuer}
                    onChange={(e) =>
                      setCertifications((prev) =>
                        prev.map((item, i) =>
                          i === certIdx
                            ? { ...item, issuer: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Date"
                    value={cert.date}
                    onChange={(e) =>
                      setCertifications((prev) =>
                        prev.map((item, i) =>
                          i === certIdx
                            ? { ...item, date: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    label="Credential ID"
                    value={cert.credentialId}
                    onChange={(e) =>
                      setCertifications((prev) =>
                        prev.map((item, i) =>
                          i === certIdx
                            ? { ...item, credentialId: e.target.value }
                            : item
                        )
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={!hasAnyData}>
          Apply to Resume
        </Button>
      </div>
    </div>
  );
}
