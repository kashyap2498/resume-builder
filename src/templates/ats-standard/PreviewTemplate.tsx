// =============================================================================
// ATS Standard - Preview Template (HTML/CSS)
// =============================================================================
// The most basic, clean template. Pure text, no colors, standard headings.
// Maximum ATS compatibility. Single column, clear section dividers.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { SectionHeading, EntryBlock, ContactLine, Divider, SkillsBlock, CustomContentBlock } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const AtsStandardPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (
          <div key={section.id} style={{ textAlign: 'center', marginBottom: `${layout.sectionSpacing}px` }}>
            <h1
              style={{
                fontSize: `${font.sizes.name}px`,
                fontFamily: font.headerFamily,
                color: colors.text,
                fontWeight: 700,
                margin: 0,
                lineHeight: font.lineHeight,
              }}
            >
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.title && (
              <div
                style={{
                  fontSize: `${font.sizes.title}px`,
                  fontFamily: font.family,
                  color: colors.lightText,
                  marginTop: '2px',
                }}
              >
                {data.contact.title}
              </div>
            )}
            <div style={{ marginTop: '4px' }}>
              <ContactLine contact={data.contact} font={font} colors={colors} layout="line" separator="|" />
            </div>
          </div>
        );

      case 'summary':
        if (!data.summary.text) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            <p
              style={{
                fontSize: `${font.sizes.normal}px`,
                fontFamily: font.family,
                color: colors.text,
                lineHeight: font.lineHeight,
                margin: '4px 0 0 0',
              }}
            >
              {data.summary.text}
            </p>
          </div>
        );

      case 'experience':
        if (data.experience.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.experience.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.position}
                subtitle={entry.company}
                dateRange={formatDateRange(entry.startDate, entry.endDate, entry.current)}
                location={entry.location}
                description={entry.description}
                highlights={entry.highlights}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.education.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={`${entry.degree}${entry.field ? ` in ${entry.field}` : ''}`}
                subtitle={entry.institution}
                dateRange={formatDateRange(entry.startDate, entry.endDate)}
                description={entry.gpa ? `GPA: ${entry.gpa}${entry.description ? ` | ${entry.description}` : ''}` : entry.description}
                highlights={entry.highlights}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            <SkillsBlock skills={data.skills} layout={data.skillsLayout} mode={data.skillsMode} font={font} colors={colors} categoryColor={colors.text} />
          </div>
        );

      case 'projects':
        if (data.projects.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.projects.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.name}
                subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined}
                dateRange={formatDateRange(entry.startDate, entry.endDate)}
                description={entry.description}
                highlights={entry.highlights}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.certifications.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.name}
                subtitle={entry.issuer}
                dateRange={entry.date}
                description={entry.credentialId ? `Credential ID: ${entry.credentialId}` : undefined}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'languages':
        if (data.languages.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            <div style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
              {data.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </div>
          </div>
        );

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.volunteer.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.role}
                subtitle={entry.organization}
                dateRange={formatDateRange(entry.startDate, entry.endDate)}
                description={entry.description}
                highlights={entry.highlights}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'awards':
        if (data.awards.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.awards.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.title}
                subtitle={entry.issuer}
                dateRange={entry.date}
                description={entry.description}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'publications':
        if (data.publications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.publications.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.title}
                subtitle={entry.publisher}
                dateRange={entry.date}
                description={entry.description}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'references':
        if (data.references.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.references.map((entry) => (
              <div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}>
                <div style={{ fontWeight: 700, fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
                  {entry.name}
                </div>
                <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: font.family, color: colors.lightText }}>
                  {entry.title}{entry.company ? `, ${entry.company}` : ''}
                </div>
                {entry.email && <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: font.family, color: colors.lightText }}>{entry.email}</div>}
                {entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: font.family, color: colors.lightText }}>{entry.phone}</div>}
              </div>
            ))}
          </div>
        );

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            <div style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
              {data.hobbies.items.join(', ')}
            </div>
          </div>
        );

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.affiliations.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.organization}
                subtitle={entry.role}
                dateRange={formatDateRange(entry.startDate, entry.endDate)}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'courses':
        if (data.courses.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
            {data.courses.map((entry) => (
              <EntryBlock
                key={entry.id}
                title={entry.name}
                subtitle={entry.institution}
                dateRange={entry.completionDate}
                description={entry.description}
                font={font}
                colors={colors}
                spacing={layout.itemSpacing}
              />
            ))}
          </div>
        );

      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (
          <React.Fragment key={section.id}>
            {data.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
                <SectionHeading title={cs.title} font={font} colors={{ ...colors, primary: colors.text }} variant="uppercase" showDivider dividerStyle="line" />
                {cs.content ? (
                  <CustomContentBlock content={cs.content} font={font} colors={colors} />
                ) : (
                  cs.entries.map((entry) => (
                    <EntryBlock
                      key={entry.id}
                      title={entry.title}
                      subtitle={entry.subtitle}
                      dateRange={entry.date}
                      description={entry.description}
                      highlights={entry.highlights}
                      font={font}
                      colors={colors}
                      spacing={layout.itemSpacing}
                    />
                  ))
                )}
              </div>
            ))}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '816px',
        margin: '0 auto',
        padding: `${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px`,
        backgroundColor: colors.background,
        fontFamily: font.family,
        color: colors.text,
        lineHeight: font.lineHeight,
      }}
    >
      {visibleSections.map(renderSection)}
    </div>
  );
};

export default AtsStandardPreview;
