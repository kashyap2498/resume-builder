// =============================================================================
// Resume Builder - ATS Keyword Dictionaries & Best Practices
// =============================================================================

// -- Industry Type ------------------------------------------------------------

export type IndustryId =
  | 'mechanical'
  | 'healthcare'
  | 'electrical'
  | 'software'
  | 'creative';

export interface IndustryKeywords {
  id: IndustryId;
  name: string;
  keywords: string[];
}

// -- Industry Keyword Dictionaries --------------------------------------------

export const INDUSTRY_KEYWORDS: IndustryKeywords[] = [
  // -- Mechanical Engineering --------------------------------------------------
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    keywords: [
      'CAD', 'SolidWorks', 'AutoCAD', 'CATIA', 'Creo', 'ANSYS',
      'FEA', 'Finite Element Analysis', 'CFD', 'Computational Fluid Dynamics',
      'GD&T', 'Geometric Dimensioning and Tolerancing',
      'CNC machining', 'injection molding', 'sheet metal fabrication',
      'thermodynamics', 'heat transfer', 'fluid mechanics',
      'materials science', 'mechanical design', 'product development',
      'prototyping', '3D printing', 'additive manufacturing',
      'root cause analysis', 'FMEA', 'Failure Mode and Effects Analysis',
      'design for manufacturing', 'DFM', 'design for assembly', 'DFA',
      'tolerance analysis', 'BOM', 'bill of materials',
      'lean manufacturing', 'Six Sigma', 'Kaizen', 'continuous improvement',
      'ISO 9001', 'quality control', 'quality assurance',
      'project management', 'cross-functional teams', 'technical documentation',
      'testing and validation', 'HVAC', 'pneumatics', 'hydraulics',
      'vibration analysis', 'fatigue analysis', 'stress analysis',
      'PLM', 'product lifecycle management', 'MATLAB', 'Simulink',
      'R&D', 'engineering drawings', 'vendor management',
    ],
  },

  // -- Healthcare --------------------------------------------------------------
  {
    id: 'healthcare',
    name: 'Healthcare',
    keywords: [
      'patient care', 'clinical assessment', 'vital signs', 'triage',
      'electronic health records', 'EHR', 'EMR', 'Epic', 'Cerner',
      'HIPAA', 'HIPAA compliance', 'patient safety',
      'medication administration', 'pharmacology', 'IV therapy',
      'wound care', 'infection control', 'sterile technique',
      'CPR', 'BLS', 'ACLS', 'first aid',
      'care coordination', 'discharge planning', 'case management',
      'interdisciplinary team', 'patient education', 'health promotion',
      'medical terminology', 'anatomy and physiology',
      'diagnostic imaging', 'laboratory results', 'blood draw', 'phlebotomy',
      'surgical procedures', 'pre-operative', 'post-operative',
      'chronic disease management', 'diabetes management', 'cardiac care',
      'mental health', 'behavioral health', 'substance abuse',
      'geriatric care', 'pediatric care', 'neonatal care',
      'telehealth', 'telemedicine', 'remote patient monitoring',
      'quality improvement', 'evidence-based practice', 'clinical research',
      'Joint Commission', 'regulatory compliance', 'patient advocacy',
      'nursing process', 'care plan', 'documentation',
      'ICD-10 coding', 'CPT coding', 'medical billing',
    ],
  },

  // -- Electrical Engineering --------------------------------------------------
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    keywords: [
      'circuit design', 'PCB design', 'PCB layout', 'schematic capture',
      'Altium Designer', 'Eagle', 'KiCad', 'OrCAD',
      'analog design', 'digital design', 'mixed-signal',
      'FPGA', 'VHDL', 'Verilog', 'HDL',
      'embedded systems', 'microcontroller', 'ARM', 'Arduino', 'Raspberry Pi',
      'firmware development', 'RTOS', 'real-time systems',
      'power electronics', 'power supply design', 'DC-DC converter',
      'signal processing', 'DSP', 'RF design', 'antenna design',
      'electromagnetic compatibility', 'EMC', 'EMI',
      'control systems', 'PLC', 'SCADA', 'automation',
      'oscilloscope', 'spectrum analyzer', 'logic analyzer',
      'SPICE simulation', 'LTspice', 'MATLAB', 'Simulink',
      'electrical safety', 'NEC', 'IEC standards', 'UL certification',
      'wiring diagrams', 'single-line diagrams', 'load calculations',
      'renewable energy', 'solar design', 'battery management systems',
      'motor control', 'servo systems', 'VFD',
      'telecommunications', 'fiber optics', 'networking',
      'testing and validation', 'design verification', 'DFT',
      'soldering', 'prototyping', 'hardware debugging',
      'technical documentation', 'BOM management', 'component selection',
    ],
  },

  // -- Software Engineering ----------------------------------------------------
  {
    id: 'software',
    name: 'Software Engineering',
    keywords: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
      'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express',
      'HTML', 'CSS', 'Tailwind CSS', 'SASS',
      'REST API', 'GraphQL', 'gRPC', 'WebSocket',
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'cloud architecture',
      'Docker', 'Kubernetes', 'containerization', 'microservices',
      'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI',
      'Git', 'version control', 'code review',
      'Agile', 'Scrum', 'Kanban', 'sprint planning',
      'test-driven development', 'TDD', 'unit testing', 'integration testing',
      'Jest', 'Cypress', 'Selenium', 'pytest',
      'data structures', 'algorithms', 'system design',
      'design patterns', 'SOLID principles', 'clean architecture',
      'performance optimization', 'scalability', 'load balancing',
      'security', 'authentication', 'authorization', 'OAuth', 'JWT',
      'machine learning', 'deep learning', 'NLP', 'computer vision',
      'DevOps', 'infrastructure as code', 'Terraform',
      'monitoring', 'observability', 'logging', 'Datadog', 'Grafana',
      'technical leadership', 'mentoring', 'architecture decisions',
    ],
  },

  // -- Creative / Design -------------------------------------------------------
  {
    id: 'creative',
    name: 'Creative & Design',
    keywords: [
      'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
      'Figma', 'Sketch', 'Adobe XD', 'Framer',
      'UI design', 'UX design', 'user interface', 'user experience',
      'wireframing', 'prototyping', 'mockups', 'high-fidelity design',
      'design systems', 'component libraries', 'style guides',
      'typography', 'color theory', 'layout', 'composition',
      'responsive design', 'mobile-first design', 'accessibility', 'WCAG',
      'user research', 'usability testing', 'A/B testing', 'heuristic evaluation',
      'persona development', 'user journey mapping', 'information architecture',
      'interaction design', 'motion design', 'animation',
      'brand identity', 'branding', 'logo design', 'visual identity',
      'print design', 'packaging design', 'editorial design',
      'photography', 'photo editing', 'retouching',
      'video production', 'video editing', 'Premiere Pro', 'DaVinci Resolve',
      'illustration', 'digital art', 'vector graphics',
      'creative strategy', 'art direction', 'creative direction',
      'presentation design', 'pitch decks', 'marketing collateral',
      'social media design', 'content creation', 'copywriting',
      'design thinking', 'ideation', 'stakeholder collaboration',
    ],
  },
];

// -- Common Action Verbs (strong resume verbs) --------------------------------

export const ACTION_VERBS: string[] = [
  'Achieved',
  'Administered',
  'Analyzed',
  'Architected',
  'Automated',
  'Built',
  'Collaborated',
  'Coordinated',
  'Delivered',
  'Designed',
  'Developed',
  'Directed',
  'Drove',
  'Engineered',
  'Enhanced',
  'Established',
  'Executed',
  'Facilitated',
  'Implemented',
  'Improved',
  'Initiated',
  'Integrated',
  'Led',
  'Managed',
  'Mentored',
  'Negotiated',
  'Optimized',
  'Orchestrated',
  'Pioneered',
  'Reduced',
  'Refactored',
  'Resolved',
  'Scaled',
  'Spearheaded',
  'Streamlined',
  'Supervised',
  'Transformed',
  'Troubleshot',
];

// -- ATS Formatting Best Practices --------------------------------------------

export interface AtsBestPractice {
  id: string;
  category: 'formatting' | 'content' | 'keywords';
  title: string;
  description: string;
}

export const ATS_BEST_PRACTICES: AtsBestPractice[] = [
  {
    id: 'bp-simple-format',
    category: 'formatting',
    title: 'Use a clean, single-column layout',
    description:
      'ATS systems parse single-column resumes most reliably. Avoid tables, text boxes, and multi-column layouts that can scramble content order.',
  },
  {
    id: 'bp-standard-headings',
    category: 'formatting',
    title: 'Use standard section headings',
    description:
      'Stick to conventional headings like "Work Experience", "Education", and "Skills". Creative alternatives may not be recognized by parsers.',
  },
  {
    id: 'bp-no-headers-footers',
    category: 'formatting',
    title: 'Keep content out of headers and footers',
    description:
      'Many ATS systems skip header and footer regions entirely. Place your name, contact details, and all other content in the main body.',
  },
  {
    id: 'bp-standard-fonts',
    category: 'formatting',
    title: 'Use standard, readable fonts',
    description:
      'Choose widely supported fonts such as Arial, Calibri, or Times New Roman at 10-12pt for body text. Avoid decorative or icon fonts.',
  },
  {
    id: 'bp-no-images',
    category: 'formatting',
    title: 'Avoid images, icons, and graphics',
    description:
      'ATS cannot read content embedded in images. Use plain text for contact icons, skill ratings, and other visual elements.',
  },
  {
    id: 'bp-pdf-format',
    category: 'formatting',
    title: 'Submit as a text-based PDF',
    description:
      'PDF preserves formatting while remaining parseable. Avoid scanned-image PDFs. If in doubt, also prepare a .docx version.',
  },
  {
    id: 'bp-keyword-match',
    category: 'keywords',
    title: 'Mirror keywords from the job description',
    description:
      'Identify key skills, qualifications, and phrases in the job posting and include them naturally throughout your resume.',
  },
  {
    id: 'bp-spell-out-acronyms',
    category: 'keywords',
    title: 'Include both acronyms and full forms',
    description:
      'Write "Search Engine Optimization (SEO)" so the ATS matches on either form. Do this for certifications, tools, and methodologies.',
  },
  {
    id: 'bp-quantify-results',
    category: 'content',
    title: 'Quantify achievements with numbers',
    description:
      'Use metrics such as percentages, dollar amounts, and counts to demonstrate impact (e.g. "Reduced build time by 40%").',
  },
  {
    id: 'bp-action-verbs',
    category: 'content',
    title: 'Start bullet points with strong action verbs',
    description:
      'Lead each accomplishment with a powerful verb like "Engineered", "Optimized", or "Delivered" instead of passive phrases.',
  },
  {
    id: 'bp-tailor-resume',
    category: 'content',
    title: 'Tailor your resume for each application',
    description:
      'Customize keywords, order of sections, and highlighted achievements to align with the specific role and company.',
  },
  {
    id: 'bp-consistent-dates',
    category: 'formatting',
    title: 'Use a consistent date format',
    description:
      'Pick one date format (e.g. "Jan 2023" or "01/2023") and use it everywhere. Inconsistency can confuse parsers.',
  },
];

// -- Helpers ------------------------------------------------------------------

/**
 * Look up a keyword dictionary by industry ID.
 */
export function getKeywordsByIndustry(industryId: IndustryId): string[] {
  const industry = INDUSTRY_KEYWORDS.find((i) => i.id === industryId);
  return industry ? industry.keywords : [];
}
