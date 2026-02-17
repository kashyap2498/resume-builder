// =============================================================================
// Bold Creative - Preview Template (HTML/CSS)
// =============================================================================
// Bold single-column with large colorful headers, creative typography.

import React from 'react';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { EntryBlock, ContactLine, SkillsBlock, CustomContentBlock } from '../shared';
import { formatDateRange } from '../shared/DateRange';

const BoldCreativePreview: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;

  const accentColor = colors.accent || '#FF6F00';

  const visibleSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: `${font.sizes.sectionHeader + 4}px`, fontFamily: font.headerFamily, color: accentColor, fontWeight: 800,
    margin: 0, marginBottom: '8px', lineHeight: font.lineHeight, textTransform: 'uppercase', letterSpacing: '3px',
  };

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing + 4}px`, textAlign: 'center' }}>
            <h1 style={{ fontSize: `${font.sizes.name + 10}px`, fontFamily: font.headerFamily, color: accentColor, fontWeight: 900, margin: 0, lineHeight: '1.0', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {data.contact.firstName} {data.contact.lastName}
            </h1>
            {data.contact.title && (
              <div style={{ fontSize: `${font.sizes.title + 2}px`, fontFamily: font.family, color: colors.text, marginTop: '8px', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' }}>
                {data.contact.title}
              </div>
            )}
            <div style={{ width: '60px', height: '4px', backgroundColor: accentColor, margin: '12px auto' }} />
            <div style={{ marginTop: '8px' }}>
              <ContactLine contact={data.contact} font={font} colors={colors} layout="line" separator="\u2022" />
            </div>
          </div>
        );

      case 'summary':
        if (!data.summary.text) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <p style={{ fontSize: `${font.sizes.normal}px`, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight, margin: 0 }}>{data.summary.text}</p>
          </div>
        );

      case 'experience':
        if (data.experience.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.experience.map((entry) => (<EntryBlock key={entry.id} title={entry.position} subtitle={entry.company} dateRange={formatDateRange(entry.startDate, entry.endDate, entry.current)} location={entry.location} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'education':
        if (data.education.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.education.map((entry) => (<EntryBlock key={entry.id} title={`${entry.degree}${entry.field ? ` in ${entry.field}` : ''}`} subtitle={entry.institution} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.gpa ? `GPA: ${entry.gpa}` : entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'skills':
        if (data.skills.length === 0) return null;
        return (
          <div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            <SkillsBlock skills={data.skills} layout={data.skillsLayout} mode={data.skillsMode} font={font} colors={colors} separator=" / " categoryColor={accentColor} categoryWeight={800} />
          </div>
        );

      case 'projects':
        if (data.projects.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.projects.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.technologies.length > 0 ? entry.technologies.join(', ') : undefined} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.certifications.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.issuer} dateRange={entry.date} description={entry.credentialId ? `Credential ID: ${entry.credentialId}` : undefined} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'languages':
        if (data.languages.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2><div style={{ fontSize: `${font.sizes.normal}px`, color: colors.text }}>{data.languages.map((lang) => `${lang.name} (${lang.proficiency})`).join(' / ')}</div></div>);

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.volunteer.map((entry) => (<EntryBlock key={entry.id} title={entry.role} subtitle={entry.organization} dateRange={formatDateRange(entry.startDate, entry.endDate)} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'awards':
        if (data.awards.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.awards.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.issuer} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'publications':
        if (data.publications.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.publications.map((entry) => (<EntryBlock key={entry.id} title={entry.title} subtitle={entry.publisher} dateRange={entry.date} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'references':
        if (data.references.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.references.map((entry) => (<div key={entry.id} style={{ marginBottom: `${layout.itemSpacing}px` }}><div style={{ fontWeight: 600, fontSize: `${font.sizes.normal}px`, color: colors.text }}>{entry.name}</div><div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</div>{entry.email && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.email}</div>}{entry.phone && <div style={{ fontSize: `${font.sizes.small}px`, color: colors.lightText }}>{entry.phone}</div>}</div>))}</div>);

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2><div style={{ fontSize: `${font.sizes.normal}px`, color: colors.text }}>{data.hobbies.items.join(' / ')}</div></div>);

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.affiliations.map((entry) => (<EntryBlock key={entry.id} title={entry.organization} subtitle={entry.role} dateRange={formatDateRange(entry.startDate, entry.endDate)} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'courses':
        if (data.courses.length === 0) return null;
        return (<div key={section.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}><h2 style={sectionTitleStyle}>{section.title}</h2>{data.courses.map((entry) => (<EntryBlock key={entry.id} title={entry.name} subtitle={entry.institution} dateRange={entry.completionDate} description={entry.description} font={font} colors={colors} spacing={layout.itemSpacing} />))}</div>);

      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (
          <React.Fragment key={section.id}>
            {data.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: `${layout.sectionSpacing}px` }}>
                <h2 style={sectionTitleStyle}>{cs.title}</h2>
                {cs.content ? (
                  <CustomContentBlock content={cs.content} font={font} colors={colors} />
                ) : (
                  cs.entries.map((entry) => (
                    <EntryBlock key={entry.id} title={entry.title} subtitle={entry.subtitle} dateRange={entry.date} description={entry.description} highlights={entry.highlights} font={font} colors={colors} spacing={layout.itemSpacing} />
                  ))
                )}
              </div>
            ))}
          </React.Fragment>
        );

      default: return null;
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '816px', margin: '0 auto', padding: `${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px`, backgroundColor: colors.background, fontFamily: font.family, color: colors.text, lineHeight: font.lineHeight }}>
      {visibleSections.map(renderSection)}
    </div>
  );
};

export default BoldCreativePreview;
