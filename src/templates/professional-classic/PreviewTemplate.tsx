// =============================================================================
// Professional Classic - Preview Template (HTML/CSS)
// =============================================================================
// Classic corporate look. Navy header area for name/title, serif-friendly headings.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { EntryBlock, ContactLine } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const ProfessionalClassicPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const headerBg = colors.headerBg || '#1a2744';
  const headerText = colors.headerText || '#ffffff';

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader}px`,
    fontFamily: font.headerFamily,
    color: colors.primary,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: '4px',
    marginBottom: '8px',
    margin: 0,
  };

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (
          <div
            key={section.id}
            style={{
              backgroundColor: headerBg,
              color: headerText,
              padding: `${layout.margins.top}px ${layout.margins.right}px`,
              margin: `-${layout.margins.top}px -${layout.margins.right}px ${layout.sectionSpacing}px -${layout.margins.left}px`,
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: `${font.sizes.name}px`,
                fontFamily: font.headerFamily,
                fontWeight: 700,
                margin: 0,
                lineHeight: font.lineHeight,
                color: headerText,
              }}
            >
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.title && (
              <div
                style={{
                  fontSize: `${font.sizes.title}px`,
                  fontFamily: font.family,
                  color: headerText,
                  opacity: 0.85,
                  marginTop: '4px',
                  letterSpacing: '1px',
                }}
              >
                {data.contact.title}
              </div>
            )}
            <div style={{ marginTop: '8px' }}>
              <ContactLine
                contact={data.contact}
                font={font}
                colors={{ ...colors, lightText: headerText, divider: `${headerText}66` }}
                layout="line"
                separator="|"
              />
            </div>
          </div>
        );

      case 'summary':
        if (!data.summary.text) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <p
              style={{
                fontSize: `${font.sizes.normal}px`,
                fontFamily: font.family,
                color: colors.text,
                lineHeight: font.lineHeight,
                margin: '6px 0 0 0',
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
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
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
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
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
          </div>
        );

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.skills.map((category) => (
                <div key={category.id} style={{ marginBottom: '4px' }}>
                  {category.category ? <><span style={{ fontWeight: 700, fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.primary }}>
                    {category.category}:
                  </span>{' '}</> : null}
                  <span style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
                    {category.items.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (data.projects.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.projects.map((entry) => (
                <EntryBlock key={entry.id} title={entry.name} subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.certifications.map((entry) => (
                <EntryBlock key={entry.id} title={entry.name} subtitle={entry.issuer} dateRange={entry.date} description={entry.credentialId ? `Credential ID: ${entry.credentialId}` : undefined} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (data.languages.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px', fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>
              {data.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}
            </div>
          </div>
        );

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.volunteer.map((entry) => (
                <EntryBlock key={entry.id} title={entry.role} subtitle={entry.organization} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'awards':
        if (data.awards.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.awards.map((entry) => (
                <EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'publications':
        if (data.publications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.publications.map((entry) => (
                <EntryBlock key={entry.id} title={entry.title} subtitle={entry.publisher} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'references':
        if (data.references.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.references.map((entry) => (
                <div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}>
                  <div style={{ fontWeight: 700, fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>{entry.name}</div>
                  <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: font.family, color: colors.lightText }}>
                    {entry.title}{entry.company ? `, ${entry.company}` : ''}
                  </div>
                  {entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}
                  {entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px', fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text }}>{data.hobbies.items.join(', ')}</div>
          </div>
        );

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.affiliations.map((entry) => (
                <EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'courses':
        if (data.courses.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <div style={{ marginTop: '6px' }}>
              {data.courses.map((entry) => (
                <EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
              ))}
            </div>
          </div>
        );

      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (
          <React.Fragment key={section.id}>
            {data.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
                <h2 style={sectionTitleStyle}>{cs.title}</h2>
                <div style={{ marginTop: '6px' }}>
                  {cs.entries.map((entry) => (
                    <EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
                  ))}
                </div>
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

export default ProfessionalClassicPreview;
