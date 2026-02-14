// =============================================================================
// Minimal Lines - PDF Template (@react-pdf/renderer)
// =============================================================================
// Clean minimal design with thin line dividers between sections.

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from '@/types/template';
import type { SectionConfig } from '@/types/resume';
import { formatDateRange } from '../shared/DateRange';
import { resolvePdfFontFamily } from '@/utils/pdfFontRegistry'

const MinimalLinesPdf: React.FC<TemplateProps> = ({ resume }) => {
  const { data, styling, sections } = resume;
  const { font, colors, layout } = styling;
  const bodyFont = resolvePdfFontFamily(font.family)
  const headerFont = resolvePdfFontFamily(font.headerFamily)

  const styles = StyleSheet.create({
    page: {
      paddingTop: layout.margins.top,
      paddingRight: layout.margins.right,
      paddingBottom: layout.margins.bottom,
      paddingLeft: layout.margins.left,
      backgroundColor: colors.background,
      fontFamily: bodyFont,
      fontSize: font.sizes.normal,
      color: colors.text,
      lineHeight: font.lineHeight,
    },
    name: {
      fontSize: font.sizes.name,
      fontFamily: headerFont,
      fontWeight: 300,
      color: colors.text,
      letterSpacing: 2,
      marginBottom: 8,
      lineHeight: 1.2,
    },
    jobTitle: {
      fontSize: font.sizes.title,
      fontWeight: 300,
      color: colors.lightText,
      letterSpacing: 1,
      marginBottom: 4,
    },
    contactLine: {
      fontSize: font.sizes.small,
      color: colors.lightText,
      marginBottom: layout.sectionSpacing,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
      marginTop: layout.sectionSpacing / 2,
      marginBottom: layout.sectionSpacing / 2,
    },
    sectionContainer: {
      marginBottom: layout.sectionSpacing,
    },
    sectionTitle: {
      fontSize: font.sizes.sectionHeader,
      fontFamily: headerFont, fontWeight: 700 as const,
      color: colors.primary,
      marginBottom: 4,
    },
    entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryTitle: {
      fontSize: font.sizes.normal,
      fontFamily: bodyFont, fontWeight: 700 as const,
      color: colors.text,
    },
    entrySubtitle: {
      fontSize: font.sizes.normal,
      fontFamily: bodyFont, fontStyle: 'italic' as const,
      color: colors.secondary,
    },
    entryDate: {
      fontSize: font.sizes.small,
      color: colors.lightText,
    },
    description: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginTop: 2,
    },
    bulletItem: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginLeft: 12,
      marginBottom: 1,
    },
    entryBlock: {
      marginBottom: layout.itemSpacing,
    },
    skillLine: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: 2,
    },
    skillCategory: {
      fontFamily: bodyFont, fontWeight: 700 as const,
    },
    bodyText: {
      fontSize: font.sizes.normal,
      color: colors.text,
    },
    smallText: {
      fontSize: font.sizes.small,
      color: colors.lightText,
    },
  });

  const visibleSections = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const renderBullets = (highlights: string[]) =>
    highlights.map((item, i) => (
      <Text key={i} style={styles.bulletItem}>
        {'\u2022'} {item}
      </Text>
    ));

  const renderSection = (section: SectionConfig, index: number) => {
    const showDividerAbove = section.type !== 'contact' && index > 0;

    let content: React.ReactNode = null;

    switch (section.type) {
      case 'contact':
        content = (
          <View>
            <Text style={styles.name}>
              {data.contact.firstName} {data.contact.lastName}
            </Text>
            {data.contact.title ? <Text style={styles.jobTitle}>{data.contact.title}</Text> : null}
            <Text style={styles.contactLine}>
              {[data.contact.email, data.contact.phone, data.contact.location, data.contact.website, data.contact.linkedin, data.contact.github]
                .filter(Boolean)
                .join(' \u00B7 ')}
            </Text>
          </View>
        );
        break;

      case 'summary':
        if (!data.summary.text) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.bodyText}>{data.summary.text}</Text>
          </View>
        );
        break;

      case 'experience':
        if (data.experience.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.experience.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.position}</Text>
                  <Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate, entry.current)}</Text>
                </View>
                <View style={styles.entryRow}>
                  <Text style={styles.entrySubtitle}>{entry.company}</Text>
                  {entry.location ? <Text style={styles.entryDate}>{entry.location}</Text> : null}
                </View>
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
                {entry.highlights.length > 0 && renderBullets(entry.highlights)}
              </View>
            ))}
          </View>
        );
        break;

      case 'education':
        if (data.education.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.education.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.degree}{entry.field ? ` in ${entry.field}` : ''}</Text>
                  <Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{entry.institution}</Text>
                {entry.gpa ? <Text style={styles.description}>GPA: {entry.gpa}</Text> : null}
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
                {entry.highlights.length > 0 && renderBullets(entry.highlights)}
              </View>
            ))}
          </View>
        );
        break;

      case 'skills':
        if (data.skills.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.skills.map((category) => (
              <Text key={category.id} style={styles.skillLine}>
                <Text style={styles.skillCategory}>{category.category}: </Text>
                {category.items.join(', ')}
              </Text>
            ))}
          </View>
        );
        break;

      case 'projects':
        if (data.projects.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.projects.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.name}</Text>
                  <Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text>
                </View>
                {entry.technologies.length > 0 && <Text style={styles.entrySubtitle}>{entry.technologies.join(', ')}</Text>}
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
                {entry.highlights.length > 0 && renderBullets(entry.highlights)}
              </View>
            ))}
          </View>
        );
        break;

      case 'certifications':
        if (data.certifications.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.certifications.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.name}</Text>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{entry.issuer}</Text>
                {entry.credentialId ? <Text style={styles.description}>Credential ID: {entry.credentialId}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'languages':
        if (data.languages.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.bodyText}>{data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</Text>
          </View>
        );
        break;

      case 'volunteer':
        if (data.volunteer.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.volunteer.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.role}</Text>
                  <Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{entry.organization}</Text>
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
                {entry.highlights.length > 0 && renderBullets(entry.highlights)}
              </View>
            ))}
          </View>
        );
        break;

      case 'awards':
        if (data.awards.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.awards.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View>
                <Text style={styles.entrySubtitle}>{entry.issuer}</Text>
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'publications':
        if (data.publications.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.publications.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View>
                <Text style={styles.entrySubtitle}>{entry.publisher}</Text>
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'references':
        if (data.references.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.references.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <Text style={styles.entryTitle}>{entry.name}</Text>
                <Text style={styles.smallText}>{entry.title}{entry.company ? `, ${entry.company}` : ''}</Text>
                {entry.email ? <Text style={styles.smallText}>{entry.email}</Text> : null}
                {entry.phone ? <Text style={styles.smallText}>{entry.phone}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'hobbies':
        if (!data.hobbies.items || data.hobbies.items.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.bodyText}>{data.hobbies.items.join(', ')}</Text>
          </View>
        );
        break;

      case 'affiliations':
        if (data.affiliations.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.affiliations.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.organization}</Text><Text style={styles.entryDate}>{formatDateRange(entry.startDate, entry.endDate)}</Text></View>
                {entry.role ? <Text style={styles.entrySubtitle}>{entry.role}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'courses':
        if (data.courses.length === 0) return null;
        content = (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {data.courses.map((entry) => (
              <View key={entry.id} style={styles.entryBlock}>
                <View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.name}</Text><Text style={styles.entryDate}>{entry.completionDate}</Text></View>
                <Text style={styles.entrySubtitle}>{entry.institution}</Text>
                {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
              </View>
            ))}
          </View>
        );
        break;

      case 'customSections':
        if (data.customSections.length === 0) return null;
        content = (
          <>
            {data.customSections.map((cs) => (
              <View key={cs.id} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{cs.title}</Text>
                {cs.entries.map((entry) => (
                  <View key={entry.id} style={styles.entryBlock}>
                    <View style={styles.entryRow}><Text style={styles.entryTitle}>{entry.title}</Text><Text style={styles.entryDate}>{entry.date}</Text></View>
                    {entry.subtitle ? <Text style={styles.entrySubtitle}>{entry.subtitle}</Text> : null}
                    {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}
                    {entry.highlights.length > 0 && renderBullets(entry.highlights)}
                  </View>
                ))}
              </View>
            ))}
          </>
        );
        break;

      default:
        return null;
    }

    return (
      <React.Fragment key={section.id}>
        {showDividerAbove && <View style={styles.divider} />}
        {content}
      </React.Fragment>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {visibleSections.map((section, index) => renderSection(section, index))}
      </Page>
    </Document>
  );
};

export default MinimalLinesPdf;
