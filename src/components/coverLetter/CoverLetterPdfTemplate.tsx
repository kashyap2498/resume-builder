// =============================================================================
// Resume Builder - Cover Letter PDF Template (@react-pdf/renderer)
// =============================================================================

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Resume } from '@/types/resume';

interface CoverLetterPdfProps {
  resume: Resume;
}

const CoverLetterPdfTemplate: React.FC<CoverLetterPdfProps> = ({ resume }) => {
  const cl = resume.coverLetter;
  const contact = resume.data.contact;
  const { font, colors, layout } = resume.styling;

  const styles = StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily: 'Helvetica',
      fontSize: font.sizes.normal,
      color: colors.text,
      lineHeight: font.lineHeight,
      paddingTop: layout.margins.top,
      paddingRight: layout.margins.right,
      paddingBottom: layout.margins.bottom,
      paddingLeft: layout.margins.left,
    },
    senderName: {
      fontSize: font.sizes.name,
      fontFamily: 'Helvetica-Bold',
      color: colors.primary,
      lineHeight: 1.2,
      marginBottom: 4,
    },
    senderContact: {
      fontSize: font.sizes.small,
      color: colors.lightText,
      marginBottom: layout.sectionSpacing,
    },
    date: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: layout.sectionSpacing,
    },
    recipientBlock: {
      marginBottom: layout.sectionSpacing,
    },
    recipientLine: {
      fontSize: font.sizes.normal,
      color: colors.text,
      lineHeight: 1.6,
    },
    salutation: {
      fontSize: font.sizes.normal,
      fontFamily: 'Helvetica-Bold',
      color: colors.text,
      marginBottom: layout.itemSpacing + 4,
    },
    paragraph: {
      fontSize: font.sizes.normal,
      color: colors.text,
      lineHeight: font.lineHeight,
      marginBottom: layout.itemSpacing + 4,
    },
    signOff: {
      fontSize: font.sizes.normal,
      color: colors.text,
      marginBottom: 4,
    },
    signatureName: {
      fontSize: font.sizes.normal,
      fontFamily: 'Helvetica-Bold',
      color: colors.text,
    },
  });

  if (!cl) return null;

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const contactParts = [contact.email, contact.phone, contact.location].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sender Header */}
        {fullName ? <Text style={styles.senderName}>{fullName}</Text> : null}
        {contactParts.length > 0 ? (
          <Text style={styles.senderContact}>{contactParts.join(' | ')}</Text>
        ) : null}

        {/* Date */}
        {cl.date ? <Text style={styles.date}>{cl.date}</Text> : null}

        {/* Recipient Block */}
        {(cl.recipientName || cl.recipientTitle || cl.companyName || cl.companyAddress) ? (
          <View style={styles.recipientBlock}>
            {cl.recipientName ? <Text style={styles.recipientLine}>{cl.recipientName}</Text> : null}
            {cl.recipientTitle ? <Text style={styles.recipientLine}>{cl.recipientTitle}</Text> : null}
            {cl.companyName ? <Text style={styles.recipientLine}>{cl.companyName}</Text> : null}
            {cl.companyAddress ? <Text style={styles.recipientLine}>{cl.companyAddress}</Text> : null}
          </View>
        ) : null}

        {/* Salutation */}
        {cl.salutation ? <Text style={styles.salutation}>{cl.salutation}</Text> : null}

        {/* Body Paragraphs */}
        {cl.openingParagraph ? <Text style={styles.paragraph}>{cl.openingParagraph}</Text> : null}
        {cl.bodyParagraph ? <Text style={styles.paragraph}>{cl.bodyParagraph}</Text> : null}
        {cl.closingParagraph ? <Text style={styles.paragraph}>{cl.closingParagraph}</Text> : null}

        {/* Sign-off */}
        {cl.signOff ? <Text style={styles.signOff}>{cl.signOff}</Text> : null}
        {fullName ? <Text style={styles.signatureName}>{fullName}</Text> : null}
      </Page>
    </Document>
  );
};

export default CoverLetterPdfTemplate;
