// =============================================================================
// Elegant Columns - Preview Template (HTML/CSS)
// =============================================================================
// Elegant two-column design. Contact and skills in sidebar, experience in main.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { EntryBlock, ContactLine } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const SIDEBAR_SECTIONS = new Set(['contact', 'skills', 'languages', 'certifications', 'hobbies']);

const ElegantColumnsPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const accentColor = colors.accent || '#5C6BC0';

  const visibleSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const sidebarSections = visibleSections.filter((s) => SIDEBAR_SECTIONS.has(s.type));
  const mainSections = visibleSections.filter((s) => !SIDEBAR_SECTIONS.has(s.type));

  const sidebarTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader - 1}px`, fontFamily: font.headerFamily, color: accentColor, fontWeight: 600,
    margin: 0, marginBottom: '8px', lineHeight: font.lineHeight, textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: `1px solid ${accentColor}`, paddingBottom: '4px',
  };

  const mainTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader}px`, fontFamily: font.headerFamily, color: accentColor, fontWeight: 600,
    margin: 0, marginBottom: '6px', lineHeight: font.lineHeight, textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: `1px solid ${colors.divider}`, paddingBottom: '4px',
  };

  const renderSidebarSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h1 style={{ fontSize: `${font.sizes.name}px`, fontFamily: font.headerFamily, color: colors.text, fontWeight: 700, margin: 0, lineHeight: font.lineHeight }}>
              {data.contact.firstName}
              <br />
              {data.contact.lastName}
            </h1>
            {data.contact.title && <div style={{ fontSize: `${font.sizes.title}px`, fontFamily: font.family, color: accentColor, marginTop: '4px', fontWeight: 500, fontStyle: 'italic' }}>{data.contact.title}</div>}
            <div style={{ width: '30px', height: '2px', backgroundColor: accentColor, margin: '10px 0' }} />
            <ContactLine contact={data.contact} font={font} colors={colors} layout="block" />
          </div>
        );
      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{section.title}</h2>
            {data.skills.map((category) => (
              <div key={category.id} style={{ marginBottom: '8px' }}>
                {category.category ? <div style={{ fontWeight: 600, fontSize: `${font.sizes.small}px`, color: accentColor, marginBottom: '2px' }}>{category.category}</div> : null}
                <div style={{ fontSize: `${font.sizes.small}px`, color: colors.text }}>{category.items.join(', ')}</div>
              </div>
            ))}
          </div>
        );
      case 'languages':
        if (data.languages.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{section.title}</h2>
            {data.languages.map((lang) => (
              <div key={lang.id} style={{ fontSize: `${font.sizes.small}px`, color: colors.text, marginBottom: '3px' }}>
                {lang.name} <span style={{ color: colors.lightText, fontStyle: 'italic' }}>({lang.proficiency})</span>
              </div>
            ))}
          </div>
        );
      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{section.title}</h2>
            {data.certifications.map((entry) => (
              <div key={entry.id} style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: `${font.sizes.small}px`, color: colors.text }}>{entry.name}</div>
                <div style={{ fontSize: `${font.sizes.small - 1}px`, color: colors.lightText }}>{entry.issuer}</div>
                {entry.date && <div style={{ fontSize: `${font.sizes.small - 1}px`, color: colors.lightText }}>{entry.date}</div>}
              </div>
            ))}
          </div>
        );
      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sidebarTitleStyle}>{section.title}</h2>
            <div style={{ fontSize: `${font.sizes.small}px`, color: colors.text }}>{data.hobbies.items.join(', ')}</div>
          </div>
        );
      default: return null;
    }
  };

  const renderMainSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'summary':
        if (!data.summary.text) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2><p style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight, margin: 0 }}>{data.summary.text}</p></div>);
      case 'experience':
        if (data.experience.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.experience.map((entry) => (<EntryBlock key={entry.id} title={entry.position} subtitle={entry.company} dateRange={formatDateRange(entry.startDate, entry.endDate, entry.current)} location={entry.location} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'education':
        if (data.education.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.education.map((entry) => (<EntryBlock key={entry.id} title={`${entry.degree}${entry.field ? ` in ${entry.field}` : ''}`} subtitle={entry.institution} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.gpa ? `GPA: ${entry.gpa}${entry.description ? ` | ${entry.description}` : ''}` : entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'projects':
        if (data.projects.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.projects.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.volunteer.map((entry) => (<EntryBlock key={entry.id} title={entry.role} subtitle={entry.organization} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'awards':
        if (data.awards.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.awards.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'publications':
        if (data.publications.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.publications.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.publisher} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'references':
        if (data.references.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.references.map((entry) => (<div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}><div style={{ fontWeight: 600, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{entry.name}</div><div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</div>{entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}{entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}</div>))}</div>);
      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.affiliations.map((entry) => (<EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'courses':
        if (data.courses.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{section.title}</h2>{data.courses.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);
      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (<React.Fragment key={section.id}>{data.customSections.map((cs) => (<div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={mainTitleStyle}>{cs.title}</h2>{cs.entries.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>))}</React.Fragment>);
      default: return null;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '816px', margin: '0 auto', display: 'flex', backgroundColor: colors.background, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight, minHeight: '1056px' }}>
      <div style={{ width: '33%', padding: `${layout.margins.top}px ${layout.margins.left * 0.6}px ${layout.margins.bottom}px ${layout.margins.left}px`, borderRight: `1px solid ${colors.divider}`, flexShrink: 0 }}>
        {sidebarSections.map(renderSidebarSection)}
      </div>
      <div style={{ width: '67%', padding: `${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left * 0.8}px` }}>
        {mainSections.map(renderMainSection)}
      </div>
    </div>
  );
};

export default ElegantColumnsPreview;
