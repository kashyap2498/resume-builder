// =============================================================================
// Academic CV - Preview Template (HTML/CSS)
// =============================================================================
// Traditional academic CV. Publications, presentations, research highlighted.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { EntryBlock, ContactLine } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const AcademicCvPreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const accentColor = colors.accent || '#37474F';

  const visibleSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader}px`, fontFamily: font.headerFamily, color: colors.text, fontWeight: 700,
    margin: 0, marginBottom: '4px', lineHeight: font.lineHeight, textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px',
  };

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h1 style={{ fontSize: `${font.sizes.name + 2}px`, fontFamily: font.headerFamily, color: colors.text, fontWeight: 700, margin: 0, lineHeight: font.lineHeight, textAlign: 'center' }}>
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.title && <div style={{ fontSize: `${font.sizes.title}px`, fontFamily: font.family, color: accentColor, marginTop: '2px', textAlign: 'center', fontStyle: 'italic' }}>{data.contact.title}</div>}
            <div style={{ marginTop: '6px', textAlign: 'center' }}><ContactLine contact={data.contact} font={font} colors={colors} layout="line" separator="|" /></div>
            <div style={{ borderBottom: `1px solid ${colors.divider}`, marginTop: '8px' }} />
          </div>
        );

      case 'summary':
        if (!data.summary.text) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Research Statement</h2><p style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight, margin: '4px 0 0 0', fontStyle: 'italic' }}>{data.summary.text}</p></div>);

      case 'education':
        if (data.education.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.education.map((entry) => (<EntryBlock key={entry.id} title={`${entry.degree}${entry.field ? ` in ${entry.field}` : ''}`} subtitle={entry.institution} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.gpa ? `GPA: ${entry.gpa}${entry.description ? ` | ${entry.description}` : ''}` : entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'publications':
        if (data.publications.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            {data.publications.map((entry) => (
              <div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px`, paddingLeft: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor, marginTop: '6px' }} />
                <div style={{ fontWeight: 700, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{entry.title}</div>
                <div style={{ fontSize: `${font.sizes.normal}px`, color: colors.secondary, fontStyle: 'italic' }}>{entry.publisher}, {entry.date}</div>
                {entry.description && <div style={{ fontSize: `${font.sizes.normal}px`, color: colors.text, marginTop: '2px' }}>{entry.description}</div>}
              </div>
            ))}
          </div>
        );

      case 'experience':
        if (data.experience.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Academic Appointments</h2>{data.experience.map((entry) => (<EntryBlock key={entry.id} title={entry.position} subtitle={entry.company} dateRange={formatDateRange(entry.startDate, entry.endDate, entry.current)} location={entry.location} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'skills':
        if (data.skills.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.skills.map((category) => (<div key={category.id} style={{ marginBottom: '4px' }}><span style={{ fontWeight: 700, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{category.category}: </span><span style={{ fontSize: `${font.sizes.normal}px`, color: colors.text }}>{category.items.map((s) => s.name).join(', ')}</span></div>))}</div>);

      case 'projects':
        if (data.projects.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Research</h2>{data.projects.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.certifications.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.issuer} dateRange={entry.date} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'languages':
        if (data.languages.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2><div style={{ fontSize: `${font.sizes.normal}px`, color: colors.text }}>{data.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(', ')}</div></div>);

      case 'awards':
        if (data.awards.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Honors & Awards</h2>{data.awards.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Service</h2>{data.volunteer.map((entry) => (<EntryBlock key={entry.id} title={entry.role} subtitle={entry.organization} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'references':
        if (data.references.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.references.map((entry) => (<div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}><div style={{ fontWeight: 600, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{entry.name}</div><div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</div>{entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}{entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}</div>))}</div>);

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2><div style={{ fontSize: `${font.sizes.normal}px`, color: colors.text }}>{data.hobbies.items.join(', ')}</div></div>);

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Professional Affiliations</h2>{data.affiliations.map((entry) => (<EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'courses':
        if (data.courses.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>Teaching</h2>{data.courses.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (<React.Fragment key={section.id}>{data.customSections.map((cs) => (<div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{cs.title}</h2>{cs.entries.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>))}</React.Fragment>);

      default: return null;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '816px', margin: '0 auto', padding: `${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px`, backgroundColor: colors.background, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight }}>
      {visibleSections.map(renderSection)}
    </div>
  );
};

export default AcademicCvPreview;
