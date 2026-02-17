// =============================================================================
// Shared Template Component - Custom Content Block (PDF / @react-pdf)
// =============================================================================

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { fromEditorHtml } from '@/utils/richTextConvert';

export interface CustomContentBlockPdfProps {
  content: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

const CustomContentBlockPdf: React.FC<CustomContentBlockPdfProps> = ({
  content,
  fontSize,
  fontFamily,
  textColor,
}) => {
  if (!content || content === '<p></p>') return null;

  const { description, highlights } = fromEditorHtml(content);

  return (
    <View>
      {description ? (
        <Text style={{ fontSize, fontFamily, color: textColor, marginBottom: 2 }}>
          {description}
        </Text>
      ) : null}
      {highlights.length > 0 &&
        highlights.map((item, i) => (
          <Text
            key={i}
            style={{
              fontSize,
              fontFamily,
              color: textColor,
              marginLeft: 12,
              marginBottom: 1,
            }}
          >
            {'\u2022'} {item}
          </Text>
        ))}
    </View>
  );
};

export default CustomContentBlockPdf;
