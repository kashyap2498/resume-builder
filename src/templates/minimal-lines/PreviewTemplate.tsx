// =============================================================================
// Minimal Lines - Preview Template (HTML/CSS)
// =============================================================================
// Clean minimal design with thin line dividers between sections.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { SectionHeading, EntryBlock, ContactLine, Divider, SkillsBlock, CustomContentBlock } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const MinimalLinesPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: SectionConfig, index: number) => {
    // Add a thin divider between sections (not before contact)
    const showDividerAbove = section.type !== 'contact' && index > 0;

    let content: React.ReactNode = null;

    switch (section.type) {
      case 'contact':
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h1
              style={{
                fontSize: `${font.sizes.name}px`,
                fontFamily: font.headerFamily,
                color: colors.text,
                fontWeight: 300,
                margin: 0,
                lineHeight: font.lineHeight,
                letterSpacing: '2px',
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
                  fontWeight: 300,
                  marginTop: '2px',
                  letterSpacing: '1px',
                }}
              >
                {data.contact.title}
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <ContactLine contact={data.contact} font={font} colors={colors} layout="line" separator={'\u00B7'} />
            </div>
          </div>
        );
        break;

      case 'summary':
        if (!data.summary.text) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'experience':
        if (data.experience.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'education':
        if (data.education.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'skills':
        if (data.skills.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            <SkillsBlock skills={data.skills} layout={data.skillsLayout} mode={data.skillsMode} font={font} colors={colors} categoryColor={colors.text} />
          </div>
        );
        break;

      case 'projects':
        if (data.projects.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'certifications':
        if (data.certifications.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'languages':
        if (data.languages.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            <div style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
              {data.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </div>
          </div>
        );
        break;

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
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
        break;

      case 'awards':
        if (data.awards.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            {data.awards.map((entry) => (
              <EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );
        break;

      case 'publications':
        if (data.publications.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            {data.publications.map((entry) => (
              <EntryBlock key={entry.id} title={entry.title} subtitle={entry.publisher} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );
        break;

      case 'references':
        if (data.references.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            {data.references.map((entry) => (
              <div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}>
                <div style={{ fontWeight: 600, fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>{entry.name}</div>
                <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: font.family, color: colors.lightText }}>
                  {entry.title}{entry.company ? `, ${entry.company}` : ''}
                </div>
                {entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}
                {entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}
              </div>
            ))}
          </div>
        );
        break;

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            <div style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>{data.hobbies.items.join(', ')}</div>
          </div>
        );
        break;

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            {data.affiliations.map((entry) => (
              <EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );
        break;

      case 'courses':
        if (data.courses.length === 0) return null;
        content = (
          <div style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <SectionHeading title={section.title} font={font} colors={colors} variant="capitalize" />
            {data.courses.map((entry) => (
              <EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );
        break;

      case 'customSections':
        if (data.customSections.length === 0) return null;
        content = (
          <>
            {data.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
                <SectionHeading title={cs.title} font={font} colors={colors} variant="capitalize" />
                {cs.content ? (
                  <CustomContentBlock content={cs.content} font={font} colors={colors} />
                ) : (
                  cs.entries.map((entry) => (
                    <EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
                  ))
                )}
              </div>
            ))}
          </>
        );
        break;

      default:
        return null;
    }

    return (
      <React.Fragment key={section.id}>
        {showDividerAbove && <Divider color={colors.divider} style="line" spacing={layout.sectionSpacing / 2} />}
        {content}
      </React.Fragment>
    );
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
      {visibleSections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default MinimalLinesPreview;
