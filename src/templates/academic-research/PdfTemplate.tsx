// =============================================================================
// Academic Research - PDF Template (@react-pdf/renderer)
// =============================================================================

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { formatDateRange } from '../shared/DateRange';

const AcademicResearchPdf: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;
  const accentColor = colors.accent || '#1B5E20';

  const styles = StyleSheet.create({
    page: { paddingTop: layout.margins.top, paddingRight: layout.margins.right, paddingBottom: layout.margins.bottom, paddingLeft: layout.margins.left, backgroundColor: colors.background, fontFamily: 'Times-Roman', fontSize: font.sizes.normal, color: colors.text, lineHeight: font.lineHeight },
    headerBlock: { textAlign: 'center', borderBottomWidth: 2, borderBottomColor: accentColor, paddingBottom: 8, marginBottom: layout.sectionSpacing },
    name: { fontSize: font.sizes.name, fontFamily: 'Times-Bold', color: colors.text, marginBottom: 8 },
    jobTitle: { fontSize: font.sizes.title, color: colors.lightText, marginBottom: 6 },
    contactLine: { fontSize: font.sizes.small, color: colors.lightText },
    sectionContainer: { marginBottom: layout.sectionSpacing },
    sectionTitle: { fontSize: font.sizes.sectionHeader, fontFamily: 'Times-Bold', color: accentColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 3 },
    entryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    entryTitle: { fontSize: font.sizes.normal, fontFamily: 'Times-Bold', color: colors.text },
    entrySubtitle: { fontSize: font.sizes.normal, fontFamily: 'Times-Italic', color: colors.secondary },
    entryDate: { fontSize: font.sizes.small, color: colors.lightText },
    description: { fontSize: font.sizes.normal, color: colors.text, marginTop: 2 },
    bulletItem: { fontSize: font.sizes.normal, color: colors.text, marginLeft: 12, marginBottom: 1 },
    entryBlock: { marginBottom: layout.itemSpacing },
    publicationEntry: { marginBottom: layout.itemSpacing, paddingLeft: 24 },
    bodyText: { fontSize: font.sizes.normal, color: colors.text },
    skillLine: { fontSize: font.sizes.normal, color: colors.text, marginBottom: 2 },
    skillCategory: { fontFamily: 'Times-Bold' },
    smallText: { fontSize: font.sizes.small, color: colors.lightText },
  });

  const visibleSections = [...sections].filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const renderBullets = (highlights: string[]) => highlights.map((item, i) => (<Text key={i} style={styles.bulletItem}>{'\u2022'} {item}</Text>));
  const contactItems = [data.contact.email, data.contact.phone, data.contact.location, data.contact.website, data.contact.linkedin, data.contact.github].filter(Boolean);

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'contact':
        return (<View key={section.id} style={styles.headerBlock}><Text style={styles.name}>{data.contact.firstName} {data.contact.lastName}</Text>{data.contact.title ? <Text style={styles.jobTitle}>{data.contact.title}</Text> : null}<Text style={styles.contactLine}>{contactItems.join(' \u2022 ')}</Text></View>);
      case 'summary':
        if (!data.summary.text) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>Research Interests</Text><Text style={styles.bodyText}>{data.summary.text}</Text></View>);
      case 'publications':
        if (data.publications.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.publications.map((entry, idx) => (<View key={entry.id} style={styles.publicationEntry}><Text style={styles.bodyText}>[{idx + 1}] {entry.title}. <Text style={styles.entrySubtitle}>{entry.publisher}</Text>, {entry.date}.{entry.description ? ` ${entry.description}` : ''}</Text></View>))}</View>);
      case 'experience':
        if (data.experience.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.experience.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.position}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate, entry.current)}</Text></View><View style={styles.entryRow}><Text style={styles.entrySubtitle}>{entry.company}</Text>{entry.location ? <Text style={styles.entryDate}>{entry.location}</Text> : null}</View>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'education':
        if (data.education.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.education.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.degree}{entry.field ? ` in ${entry.field}` : ''}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View><Text style={styles.entrySubtitle}>{entry.institution}</Text>{entry.gpa ? <Text style={styles.description}>GPA: {entry.gpa}</Text> : null}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'skills':
        if (data.skills.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.skills.map((category) => (<Text key={category.id} style={styles.skillLine}><Text style={styles.skillCategory}>{category.category}: </Text>{category.items.map((s) => s.name).join(', ')}</Text>))}</View>);
      case 'projects':
        if (data.projects.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>Research Projects</Text>{data.projects.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View>{entry.technologies.length > 0 && <Text style={styles.entrySubtitle}>{entry.technologies.join(', ')}</Text>}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'certifications':
        if (data.certifications.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.certifications.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{entry.date}</Text></View><Text style={styles.entrySubtitle}>{entry.issuer}</Text></View>))}</View>);
      case 'languages':
        if (data.languages.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.bodyText}>{data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</Text></View>);
      case 'awards':
        if (data.awards.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>Honors & Awards</Text>{data.awards.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View><Text style={styles.entrySubtitle}>{entry.issuer}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}</View>))}</View>);
      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.volunteer.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.role}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View><Text style={styles.entrySubtitle}>{entry.organization}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>);
      case 'references':
        if (data.references.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.references.map((entry) => (<View key={entry.id} style={styles.entryBlock}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.smallText}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</Text>{entry.email ? <Text style={styles.smallText}>{entry.email}</Text> : null}{entry.phone ? <Text style={styles.smallText}>{entry.phone}</Text> : null}</View>))}</View>);
      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.bodyText}>{data.hobbies.items.join(', ')}</Text></View>);
      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>Professional Memberships</Text>{data.affiliations.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.organization}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View>{entry.role ? <Text style={styles.entrySubtitle}>{entry.role}</Text> : null}</View>))}</View>);
      case 'courses':
        if (data.courses.length === 0) return null;
        return (<View key={section.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{section.title}</Text>{data.courses.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{entry.completionDate}</Text></View><Text style={styles.entrySubtitle}>{entry.institution}</Text>{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}</View>))}</View>);
      case 'customSections':
        if (data.customSections.length === 0) return null;
        return (<React.Fragment key={section.id}>{data.customSections.map((cs) => (<View key={cs.id} style={styles.sectionContainer}><Text style={styles.sectionTitle}>{cs.title}</Text>{cs.entries.map((entry) => (<View key={entry.id} style={styles.entryBlock}><View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View>{entry.subtitle ? <Text style={styles.entrySubtitle}>{entry.subtitle}</Text> : null}{entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}{entry.highlights.length > 0 && renderBullets(entry.highlights)}</View>))}</View>))}</React.Fragment>);
      default: return null;
    }
  };

  return (<Document><Page size="A4" style={styles.page}>{visibleSections.map(renderSection)}</Page></Document>);
};

export default AcademicResearchPdf;
