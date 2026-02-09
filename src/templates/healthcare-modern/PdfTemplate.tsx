// =============================================================================
// Healthcare Modern - PDF Template (@react-pdf/renderer)
// =============================================================================

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { formatDateRange } from '../shared/DateRange';

const SIDEBAR_SECTIONS = new Set(['contact', 'skills', 'certifications', 'languages', 'hobbies']);

const HealthcareModernPdf: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;
  const tealColor = colors.accent || '#00897B';

  const styles = StyleSheet.create({
    page: { backgroundColor: colors.background, fontFamily: 'Helvetica', fontSize: font.sizes.normal, color: colors.text, lineHeight: font.lineHeight, flexDirection: 'row' },
    sidebar: { width: '35%', backgroundColor: tealColor, paddingTop: layout.margins.top, paddingBottom: layout.margins.bottom, paddingLeft: layout.margins.left, paddingRight: layout.margins.left * 0.6 },
    main: { width: '65%', paddingTop: layout.margins.top, paddingBottom: layout.margins.bottom, paddingLeft: layout.margins.left * 0.8, paddingRight: layout.margins.right },
    name: { fontSize: font.sizes.name, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 4 },
    jobTitle: { fontSize: font.sizes.title, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
    contactItem: { fontSize: font.sizes.small, color: 'rgba(255,255,255,0.75)', marginBottom: 3 },
    sidebarSection: { marginBottom: layout.sectionSpacing },
    sidebarSectionTitle: { fontSize: font.sizes.sectionHeader - 1, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 4 },
    sidebarCategoryName: { fontSize: font.sizes.small, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.9)', marginBottom: 2 },
    sidebarText: { fontSize: font.sizes.small, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
    sidebarEntryTitle: { fontSize: font.sizes.small, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
    sidebarEntrySubtitle: { fontSize: font.sizes.small - 1, color: 'rgba(255,255,255,0.65)' },
    mainSection: { marginBottom: layout.sectionSpacing },
    mainSectionTitle: { fontSize: font.sizes.sectionHeader, fontFamily: 'Helvetica-Bold', color: tealColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, borderBottomWidth: 2, borderBottomColor: tealColor, paddingBottom: 4 },
    entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    entryTitle: { fontSize: font.sizes.normal, fontFamily: 'Helvetica-Bold', color: colors.text },
    entrySubtitle: { fontSize: font.sizes.normal, fontFamily: 'Helvetica-Oblique', color: colors.secondary },
    entryDate: { fontSize: font.sizes.small, color: colors.lightText },
    description: { fontSize: font.sizes.normal, color: colors.text, marginTop: 2 },
    bulletItem: { fontSize: font.sizes.normal, color: colors.text, marginLeft: 12, marginBottom: 1 },
    entryBlock: { marginBottom: layout.itemSpacing },
    bodyText: { fontSize: font.sizes.normal, color: colors.text },
    smallText: { fontSize: font.sizes.small, color: colors.lightText },
  });

  const visibleSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const sidebarSecs = visibleSections.filter((s) => SIDEBAR_SECTIONS.has(s.type));
  const mainSecs = visibleSections.filter((s) => !SIDEBAR_SECTIONS.has(s.type));

  const renderBullets = (highlights: string[]) => highlights.map((item, i) => (<Text key={i} style={styles.bulletItem}>{'\u2022'} {item}</Text>));
  const contactItems = [data.contact.email, data.contact.phone, data.contact.location, data.contact.website, data.contact.linkedin, data.contact.github].filter(Boolean);

  const renderSidebarSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (<View key={section.id} style={styles.sidebarSection}><Text style={styles.name}>{data.contact.firstName} {data.contact.lastName}</Text>{data.contact.title ? <Text style={styles.jobTitle}>{data.contact.title}</Text> : null}{contactItems.map((item, i) => (<Text key={i} style={styles.contactItem}>{item}</Text>))}</View>);
      case 'skills':
        if (data.skills.length === 0) return null;
        return (<View key={section.id} style={styles.sidebarSection}><Text style={styles.sidebarSectionTitle}>{section.title}</Text>{data.skills.map((category) => (<View key={category.id} style={{ marginBottom: 6 }}><Text style={styles.sidebarCategoryName}>{category.category}</Text><Text style={styles.sidebarText}>{category.items.map((s) => s.name).join(', ')}</Text></View>))}</View>);
      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (<View key={section.id} style={styles.sidebarSection}><Text style={styles.sidebarSectionTitle}>{section.title}</Text>{data.certifications.map((entry) => (<View key={entry.id} style={{ marginBottom: 6 }}><Text style={styles.sidebarEntryTitle}>{entry.name}</Text><Text style={styles.sidebarEntrySubtitle}>{entry.issuer}</Text>{entry.date ? <Text style={styles.sidebarEntrySubtitle}>{entry.date}</Text> : null}</View>))}</View>);
      case 'languages':
        if (data.languages.length === 0) return null;
        return (<View key={section.id} style={styles.sidebarSection}><Text style={styles.sidebarSectionTitle}>{section.title}</Text>{data.languages.map((lang) => (<Text key={lang.id} style={styles.sidebarText}>{lang.name} - {lang.proficiency}</Text>))}</View>);
      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (<View key={section.id} style={styles.sidebarSection}><Text style={styles.sidebarSectionTitle}>{section.title}</Text><Text style={styles.sidebarText}>{data.hobbies.items.join(', ')}</Text></View>);
      default: return null;
    }
  };

  const renderMainSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'summary':
        if (!data.summary.text) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text><Text style={styles.bodyText}>{data.summary.text}</Text></View>);
      case 'experience':
        if (data.experience.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.experience.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.position}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate, entry.current)}</Text></View><View style={styles.entryRow}><Text style={styles.entrySubtitle}>{entry.company}</Text>{entry.location ? <Text style={styles.entryDate}>{entry.location}</Text> : null}</View>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'education':
        if (data.education.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.education.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.degree}{entry.field ? ` in ${entry.field}` : ''}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View><Text style={styles.entrySubtitle}>{entry.institution}</Text>{entry.gpa ? <Text style={styles.description}>GPA: {entry.gpa}</Text> : null}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'projects':
        if (data.projects.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.projects.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View>{entry.technologies.length > 0 && <Text style={styles.entrySubtitle}>{entry.technologies.join(', ')}</Text>}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.volunteer.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.role}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View><Text style={styles.entrySubtitle}>{entry.organization}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'awards':
        if (data.awards.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.awards.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View><Text style={styles.entrySubtitle}>{entry.issuer}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}</View>))}</View>);
      case 'publications':
        if (data.publications.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.publications.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View><Text style={styles.entrySubtitle}>{entry.publisher}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}</View>))}</View>);
      case 'references':
        if (data.references.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.references.map((entry) => (<View key={entry.id} style={styles.entryBlock}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.smallText}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</Text>{entry.email ? <Text style={styles.smallText}>{entry.email}</Text> : null}{entry.phone ? <Text style={styles.smallText}>{entry.phone}</Text> : null}</View>))}</View>);
      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.affiliations.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.organization}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View>{entry.role ? <Text style={styles.entrySubtitle}>{entry.role}</Text> : null}</View>))}</View>);
      case 'courses':
        if (data.courses.length === 0) return null;
        return (<View key={section.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{section.title}</Text>{data.courses.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{entry.completionDate}</Text></View><Text style={styles.entrySubtitle}>{entry.institution}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}</View>))}</View>);
      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (<React.Fragment key={section.id}>{data.customSections.map((cs) => (<View key={cs.id} style={styles.mainSection}><Text style={styles.mainSectionTitle}>{cs.title}</Text>{cs.entries.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View>{entry.subtitle ? <Text style={styles.entrySubtitle}>{entry.subtitle}</Text> : null}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>))}</React.Fragment>);
      default: return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebar}>{sidebarSecs.map(renderSidebarSection)}</View>
        <View style={styles.main}>{mainSecs.map(renderMainSection)}</View>
      </Page>
    </Document>
  );
};

export default HealthcareModernPdf;
