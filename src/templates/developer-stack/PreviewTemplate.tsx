// =============================================================================
// Developer Stack - Preview Template (HTML/CSS)
// =============================================================================
// Developer-focused. Left sidebar with tech stack/skills. Code-inspired aesthetic.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { EntryBlock, ContactLine } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const SIDEBAR_SECTIONS = new Set(['skills', 'languages', 'certifications', 'hobbies']);

const DeveloperStackPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const accentColor = colors.accent || '#61DAFB';
  const darkBg = '#282c34';

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const sidebarSections = visibleSections.filter((s) => SIDEBAR_SECTIONS.has(s.type));
  const mainSections = visibleSections.filter((s) => s.type !== 'contact' && !SIDEBAR_SECTIONS.has(s.type));

  const sidebarTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader - 1}px`,
    fontFamily: '"Courier New", Courier, monospace',
    color: accentColor,
    fontWeight: 700,
    margin: 0,
    marginBottom: '8px',
    lineHeight: font.lineHeight,
    textTransform: 'lowercase',
    letterSpacing: '1px',
  };

  const mainTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader}px`,
    fontFamily: font.headerFamily,
    color: colors.text,
    fontWeight: 600,
    margin: 0,
    marginBottom: '6px',
    lineHeight: font.lineHeight,
    borderBottom: `2px solid ${accentColor}`,
    paddingBottom: '4px',
  };

  const renderSidebarSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{'// '}{section.title}</h2>
            {data.skills.map((category) => (
              <div key={category.id} style={{ marginBottom: '8px' }}>
                {category.category ? <div style={{ fontWeight: 700, fontSize: `${font.sizes.small}px`, fontFamily: '"Courier New", monospace', color: '#e06c75', marginBottom: '3px' }}>
                  {category.category}
                </div> : null}
                {category.items.map((s) => (
                  <div key={s} style={{ fontSize: `${font.sizes.small}px`, fontFamily: '"Courier New", monospace', color: '#abb2bf', marginBottom: '1px', paddingLeft: '8px' }}>
                    {'- '}{s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case 'languages':
        if (data.languages.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{'// '}{section.title}</h2>
            {data.languages.map((lang) => (
              <div key={lang.id} style={{ fontSize: `${font.sizes.small}px`, fontFamily: '"Courier New", monospace', color: '#abb2bf', marginBottom: '3px' }}>
                {lang.name}: <span style={{ color: '#98c379' }}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        );

      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{'// '}{section.title}</h2>
            {data.certifications.map((entry) => (
              <div key={entry.id} style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: `${font.sizes.small}px`, fontFamily: '"Courier New", monospace', color: '#e5c07b' }}>{entry.name}</div>
                <div style={{ fontSize: `${font.sizes.small - 1}px`, fontFamily: '"Courier New", monospace', color: '#abb2bf' }}>{entry.issuer}</div>
              </div>
            ))}
          </div>
        );

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{'// '}{section.title}</h2>
            <div style={{ fontSize: `${font.sizes.small}px`, fontFamily: '"Courier New", monospace', color: '#abb2bf' }}>
              {data.hobbies.items.join(', ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMainSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'summary':
        if (!data.summary.text) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            <p style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight, margin: 0 }}>
              {data.summary.text}
            </p>
          </div>
        );

      case 'experience':
        if (data.experience.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.experience.map((entry) => (
              <EntryBlock key={entry.id} title={entry.position} subtitle={entry.company} dateRange={formatDateRange(entry.startDate, entry.endDate, entry.current)} location={entry.location} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'education':
        if (data.education.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.education.map((entry) => (
              <EntryBlock key={entry.id} title={`${entry.degree}${entry.field ? ` in ${entry.field}` : ''}`} subtitle={entry.institution} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.gpa ? `GPA: ${entry.gpa}${entry.description ? ` | ${entry.description}` : ''}` : entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'projects':
        if (data.projects.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.projects.map((entry) => (
              <EntryBlock key={entry.id} title={entry.name} subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.volunteer.map((entry) => (
              <EntryBlock key={entry.id} title={entry.role} subtitle={entry.organization} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'awards':
        if (data.awards.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.awards.map((entry) => (
              <EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'publications':
        if (data.publications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.publications.map((entry) => (
              <EntryBlock key={entry.id} title={entry.title} subtitle={entry.publisher} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'references':
        if (data.references.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.references.map((entry) => (
              <div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}>
                <div style={{ fontWeight: 600, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{entry.name}</div>
                <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</div>
                {entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}
                {entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}
              </div>
            ))}
          </div>
        );

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.affiliations.map((entry) => (
              <EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'courses':
        if (data.courses.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={mainTitleStyle}>{section.title}</h2>
            {data.courses.map((entry) => (
              <EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />
            ))}
          </div>
        );

      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (
          <React.Fragment key={section.id}>
            {data.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
                <h2 style={mainTitleStyle}>{cs.title}</h2>
                {cs.entries.map((entry) => (
                  <EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
                ))}
              </div>
            ))}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '816px', margin: '0 auto', backgroundColor: colors.background, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight }}>
      {/* Header spanning full width */}
      <div style={{ padding: `${layout.margins.top}px ${layout.margins.right}px 0 ${layout.margins.left}px`, backgroundColor: darkBg, color: '#ffffff' }}>
        <h1 style={{ fontSize: `${font.sizes.name}px`, fontFamily: '"Courier New", Courier, monospace', color: accentColor, fontWeight: 700, margin: 0, lineHeight: font.lineHeight }}>
          {'<'}{data.contact.firstName} {data.contact.lastName}{' />'}
        </h1>
        {data.contact.title && (
          <div style={{ fontSize: `${font.sizes.title}px`, fontFamily: '"Courier New", monospace', color: '#abb2bf', marginTop: '4px' }}>
            {data.contact.title}
          </div>
        )}
        <div style={{ marginTop: '8px', marginBottom: '12px' }}>
          <ContactLine contact={data.contact} font={font} colors={{ ...colors, lightText: '#abb2bf', divider: '#5c6370' }} layout="line" separator="|" />
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '30%', backgroundColor: darkBg, padding: `${layout.sectionSpacing}px ${layout.margins.left * 0.6}px ${layout.margins.bottom}px ${layout.margins.left}px` }}>
          {sidebarSections.map(renderSidebarSection)}
        </div>
        <div style={{ width: '70%', padding: `${layout.sectionSpacing}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left * 0.8}px` }}>
          {mainSections.map(renderMainSection)}
        </div>
      </div>
    </div>
  );
};

export default DeveloperStackPreview;
