// =============================================================================
// Resume Builder - ATS Keyword Dictionaries & Best Practices
// =============================================================================

// -- Industry Type ------------------------------------------------------------

export type IndustryId =
  | 'mechanical'
  | 'healthcare'
  | 'electrical'
  | 'software'
  | 'creative'
  | 'finance'
  | 'marketing'
  | 'data_science'
  | 'human_resources'
  | 'sales'
  | 'legal'
  | 'education'
  | 'product_management'
  | 'cybersecurity'
  | 'operations'
  | 'consulting'
  | 'government'
  | 'biotech'
  | 'hospitality'
  | 'retail'
  | 'construction';

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

  // -- Finance & Banking -------------------------------------------------------
  {
    id: 'finance',
    name: 'Finance & Banking',
    keywords: [
      'financial analysis', 'financial modeling', 'financial reporting',
      'DCF', 'discounted cash flow', 'valuation', 'M&A', 'mergers and acquisitions',
      'Bloomberg', 'Bloomberg Terminal', 'Capital IQ', 'FactSet',
      'risk management', 'risk assessment', 'credit risk', 'market risk',
      'portfolio management', 'asset management', 'wealth management',
      'investment banking', 'equity research', 'fixed income',
      'derivatives', 'options pricing', 'hedge fund',
      'Basel III', 'Dodd-Frank', 'regulatory compliance', 'SOX compliance',
      'GAAP', 'IFRS', 'audit', 'internal controls',
      'budgeting', 'forecasting', 'variance analysis', 'P&L',
      'Excel', 'VBA', 'SQL', 'Python', 'R',
      'CPA', 'CFA', 'FRM', 'Series 7', 'Series 63',
      'accounts payable', 'accounts receivable', 'general ledger',
      'tax planning', 'tax compliance', 'transfer pricing',
      'treasury', 'cash management', 'working capital',
      'private equity', 'venture capital', 'IPO',
      'anti-money laundering', 'AML', 'KYC', 'know your customer',
      'financial statements', 'balance sheet', 'income statement', 'cash flow',
    ],
  },

  // -- Marketing & Digital Marketing -------------------------------------------
  {
    id: 'marketing',
    name: 'Marketing & Digital Marketing',
    keywords: [
      'SEO', 'SEM', 'search engine optimization', 'search engine marketing',
      'Google Analytics', 'Google Ads', 'Google Tag Manager',
      'content strategy', 'content marketing', 'content creation',
      'social media marketing', 'social media management',
      'Facebook Ads', 'Instagram', 'LinkedIn', 'TikTok', 'Twitter',
      'email marketing', 'Mailchimp', 'HubSpot', 'Marketo', 'Klaviyo',
      'CRM', 'customer relationship management', 'Salesforce',
      'marketing automation', 'lead generation', 'demand generation',
      'brand management', 'brand strategy', 'brand awareness',
      'market research', 'competitive analysis', 'consumer insights',
      'copywriting', 'storytelling', 'messaging',
      'A/B testing', 'conversion rate optimization', 'CRO',
      'PPC', 'pay-per-click', 'display advertising', 'programmatic',
      'affiliate marketing', 'influencer marketing', 'partnerships',
      'PR', 'public relations', 'media relations', 'press releases',
      'analytics', 'KPIs', 'ROI', 'attribution', 'funnel analysis',
      'Canva', 'Adobe Creative Suite', 'video marketing',
      'product marketing', 'go-to-market', 'GTM',
      'event marketing', 'webinars', 'trade shows',
    ],
  },

  // -- Data Science & Analytics ------------------------------------------------
  {
    id: 'data_science',
    name: 'Data Science & Analytics',
    keywords: [
      'Python', 'R', 'SQL', 'pandas', 'NumPy', 'SciPy',
      'scikit-learn', 'TensorFlow', 'PyTorch', 'Keras',
      'machine learning', 'deep learning', 'neural networks',
      'natural language processing', 'NLP', 'computer vision',
      'statistical modeling', 'regression', 'classification', 'clustering',
      'A/B testing', 'hypothesis testing', 'Bayesian statistics',
      'data visualization', 'Tableau', 'Power BI', 'matplotlib', 'seaborn',
      'Jupyter', 'Jupyter Notebook', 'Google Colab',
      'big data', 'Spark', 'Hadoop', 'Hive', 'Presto',
      'ETL', 'data pipeline', 'data engineering', 'Airflow',
      'AWS', 'GCP', 'Azure', 'Snowflake', 'Redshift', 'BigQuery',
      'feature engineering', 'model deployment', 'MLOps',
      'time series analysis', 'forecasting', 'anomaly detection',
      'recommendation systems', 'reinforcement learning',
      'data governance', 'data quality', 'data catalog',
      'experiment design', 'causal inference', 'propensity scoring',
      'Git', 'Docker', 'REST API', 'JSON',
    ],
  },

  // -- Human Resources ---------------------------------------------------------
  {
    id: 'human_resources',
    name: 'Human Resources',
    keywords: [
      'talent acquisition', 'recruiting', 'sourcing', 'interviewing',
      'onboarding', 'offboarding', 'employee lifecycle',
      'HRIS', 'Workday', 'ADP', 'BambooHR', 'SAP SuccessFactors',
      'employee relations', 'conflict resolution', 'investigations',
      'performance management', 'performance reviews', 'goal setting',
      'compensation', 'benefits administration', 'total rewards',
      'payroll', 'payroll processing', 'payroll compliance',
      'learning and development', 'L&D', 'training programs',
      'employee engagement', 'culture', 'retention',
      'diversity equity inclusion', 'DEI', 'belonging',
      'labor law', 'employment law', 'FMLA', 'ADA', 'EEOC', 'FLSA',
      'workforce planning', 'succession planning', 'talent management',
      'organizational development', 'change management',
      'HR analytics', 'people analytics', 'workforce analytics',
      'PHR', 'SPHR', 'SHRM-CP', 'SHRM-SCP',
      'compliance', 'policy development', 'handbook',
      'background checks', 'I-9', 'E-Verify',
      'job descriptions', 'competency models', 'career development',
    ],
  },

  // -- Sales & Business Development --------------------------------------------
  {
    id: 'sales',
    name: 'Sales & Business Development',
    keywords: [
      'Salesforce', 'HubSpot', 'CRM', 'pipeline management',
      'quota attainment', 'quota', 'revenue growth', 'sales targets',
      'lead generation', 'prospecting', 'cold calling', 'cold emailing',
      'account management', 'key accounts', 'strategic accounts',
      'business development', 'partnerships', 'channel sales',
      'B2B sales', 'B2C sales', 'enterprise sales', 'SaaS sales',
      'solution selling', 'consultative selling', 'SPIN selling', 'Challenger sale',
      'sales cycle', 'closing', 'negotiation', 'contract negotiation',
      'sales forecasting', 'territory management', 'territory planning',
      'presentation skills', 'product demos', 'proof of concept', 'POC',
      'upselling', 'cross-selling', 'customer retention', 'churn reduction',
      'customer success', 'client relationships', 'relationship management',
      'RFP', 'RFI', 'proposal writing', 'SOW',
      'market development', 'new business', 'customer acquisition',
      'sales enablement', 'sales operations', 'sales analytics',
      'LinkedIn Sales Navigator', 'Outreach', 'SalesLoft', 'ZoomInfo',
      'SDR', 'BDR', 'AE', 'account executive',
    ],
  },

  // -- Legal -------------------------------------------------------------------
  {
    id: 'legal',
    name: 'Legal',
    keywords: [
      'contract drafting', 'contract review', 'contract negotiation',
      'litigation', 'dispute resolution', 'arbitration', 'mediation',
      'Westlaw', 'LexisNexis', 'legal research', 'case law',
      'compliance', 'regulatory compliance', 'risk management',
      'due diligence', 'M&A', 'mergers and acquisitions',
      'intellectual property', 'patents', 'trademarks', 'copyrights',
      'corporate governance', 'board meetings', 'securities',
      'employment law', 'labor law', 'discrimination', 'harassment',
      'real estate law', 'lease agreements', 'title review',
      'data privacy', 'GDPR', 'CCPA', 'data protection',
      'legal writing', 'brief writing', 'motions', 'pleadings',
      'deposition', 'discovery', 'e-discovery', 'document review',
      'trial preparation', 'courtroom experience', 'oral arguments',
      'client counseling', 'legal advice', 'attorney-client privilege',
      'NDA', 'non-disclosure agreement', 'SLA', 'service level agreement',
      'regulatory filings', 'SEC filings', 'government contracts',
      'bar admission', 'JD', 'Juris Doctor', 'LLM',
      'pro bono', 'legal aid', 'access to justice',
    ],
  },

  // -- Education & Teaching ----------------------------------------------------
  {
    id: 'education',
    name: 'Education & Teaching',
    keywords: [
      'curriculum development', 'lesson planning', 'instructional design',
      'IEP', 'individualized education program', 'special education',
      'assessment', 'formative assessment', 'summative assessment',
      'differentiated instruction', 'scaffolding', 'student engagement',
      'classroom management', 'behavior management', 'positive discipline',
      'LMS', 'learning management system', 'Canvas', 'Blackboard', 'Google Classroom',
      'educational technology', 'ed tech', 'blended learning',
      'distance learning', 'online teaching', 'remote instruction',
      'student achievement', 'test scores', 'academic performance',
      'literacy', 'reading comprehension', 'writing instruction',
      'STEM education', 'project-based learning', 'PBL',
      'Common Core', 'state standards', 'accreditation',
      'parent communication', 'parent-teacher conferences',
      'professional development', 'continuing education',
      'tutoring', 'mentoring', 'academic advising',
      'ESL', 'ELL', 'English language learners', 'bilingual education',
      'higher education', 'university', 'college', 'K-12',
      'research', 'grant writing', 'academic publishing',
    ],
  },

  // -- Product Management ------------------------------------------------------
  {
    id: 'product_management',
    name: 'Product Management',
    keywords: [
      'product roadmap', 'product strategy', 'product vision',
      'user stories', 'user requirements', 'acceptance criteria',
      'Jira', 'Confluence', 'Asana', 'Linear', 'Notion',
      'A/B testing', 'experimentation', 'feature flags',
      'OKRs', 'objectives and key results', 'KPIs', 'metrics',
      'PRD', 'product requirements document', 'specifications',
      'agile', 'scrum', 'sprint planning', 'backlog grooming',
      'stakeholder management', 'cross-functional collaboration',
      'competitive analysis', 'market analysis', 'TAM', 'SAM', 'SOM',
      'go-to-market', 'GTM', 'product launch', 'release management',
      'customer discovery', 'user interviews', 'user feedback',
      'data-driven', 'analytics', 'product analytics', 'Mixpanel', 'Amplitude',
      'MVP', 'minimum viable product', 'product-market fit',
      'wireframing', 'prototyping', 'Figma', 'design collaboration',
      'prioritization', 'RICE scoring', 'impact vs effort',
      'platform strategy', 'API strategy', 'ecosystem',
      'growth', 'retention', 'activation', 'engagement',
      'technical product management', 'system design', 'architecture',
    ],
  },

  // -- Cybersecurity -----------------------------------------------------------
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    keywords: [
      'penetration testing', 'pen testing', 'vulnerability assessment',
      'SIEM', 'security information and event management', 'Splunk', 'QRadar',
      'incident response', 'incident management', 'forensics',
      'NIST', 'NIST framework', 'ISO 27001', 'SOC 2',
      'firewalls', 'IDS', 'IPS', 'intrusion detection',
      'encryption', 'PKI', 'SSL/TLS', 'cryptography',
      'network security', 'endpoint security', 'cloud security',
      'identity and access management', 'IAM', 'SSO', 'MFA',
      'threat modeling', 'risk assessment', 'security architecture',
      'OWASP', 'web application security', 'SQL injection', 'XSS',
      'malware analysis', 'reverse engineering', 'threat intelligence',
      'compliance', 'HIPAA', 'PCI DSS', 'GDPR', 'SOX',
      'CISSP', 'CEH', 'CompTIA Security+', 'OSCP',
      'red team', 'blue team', 'purple team', 'security operations',
      'SOC', 'security operations center', 'monitoring',
      'zero trust', 'least privilege', 'defense in depth',
      'DLP', 'data loss prevention', 'backup and recovery',
      'vulnerability management', 'patch management', 'hardening',
      'security awareness', 'phishing', 'social engineering',
    ],
  },

  // -- Operations & Supply Chain -----------------------------------------------
  {
    id: 'operations',
    name: 'Operations & Supply Chain',
    keywords: [
      'ERP', 'enterprise resource planning', 'SAP', 'Oracle ERP',
      'inventory management', 'warehouse management', 'WMS',
      'logistics', 'supply chain management', 'SCM', 'procurement',
      'Six Sigma', 'lean', 'lean manufacturing', 'Kaizen', 'continuous improvement',
      'process improvement', 'process optimization', 'process mapping',
      'demand planning', 'demand forecasting', 'S&OP',
      'vendor management', 'supplier management', 'contract negotiation',
      'quality management', 'quality assurance', 'QA', 'ISO 9001',
      'project management', 'PMP', 'Gantt charts', 'Microsoft Project',
      'capacity planning', 'resource allocation', 'workforce management',
      'KPIs', 'metrics', 'dashboards', 'reporting',
      'cost reduction', 'cost optimization', 'budget management',
      'distribution', 'freight', 'shipping', 'last mile delivery',
      'manufacturing', 'production planning', 'MRP',
      'health and safety', 'OSHA', 'workplace safety',
      'change management', 'stakeholder management',
      'data analysis', 'Excel', 'SQL', 'Tableau',
      'cross-functional teams', 'team leadership',
    ],
  },

  // -- Consulting --------------------------------------------------------------
  {
    id: 'consulting',
    name: 'Consulting',
    keywords: [
      'stakeholder management', 'client management', 'relationship management',
      'business analysis', 'requirements gathering', 'gap analysis',
      'strategy', 'strategic planning', 'corporate strategy',
      'change management', 'transformation', 'organizational design',
      'process improvement', 'process reengineering', 'BPR',
      'project management', 'program management', 'PMO',
      'presentation skills', 'executive presentations', 'storytelling',
      'data analysis', 'quantitative analysis', 'financial analysis',
      'PowerPoint', 'Excel', 'Tableau', 'SQL',
      'market sizing', 'TAM', 'competitive landscape',
      'due diligence', 'benchmarking', 'best practices',
      'implementation', 'execution', 'delivery',
      'industry expertise', 'domain knowledge', 'thought leadership',
      'proposal writing', 'RFP response', 'SOW',
      'team management', 'mentoring', 'coaching',
      'agile', 'waterfall', 'hybrid methodology',
      'IT consulting', 'management consulting', 'operations consulting',
      'digital transformation', 'cloud migration', 'ERP implementation',
      'cost-benefit analysis', 'ROI analysis', 'business case',
    ],
  },

  // -- Government & Public Sector ----------------------------------------------
  {
    id: 'government',
    name: 'Government & Public Sector',
    keywords: [
      'policy analysis', 'policy development', 'policy implementation',
      'grant writing', 'grant management', 'federal grants',
      'FOIA', 'freedom of information', 'public records',
      'procurement', 'government contracts', 'FAR', 'DFAR',
      'regulatory compliance', 'regulations', 'rule-making',
      'budget management', 'appropriations', 'fiscal management',
      'program management', 'program evaluation', 'performance metrics',
      'stakeholder engagement', 'public engagement', 'constituent services',
      'legislative affairs', 'lobbying', 'advocacy',
      'intergovernmental relations', 'interagency coordination',
      'security clearance', 'top secret', 'secret', 'public trust',
      'emergency management', 'disaster response', 'FEMA',
      'public administration', 'government operations',
      'data analysis', 'statistics', 'demographic analysis',
      'GIS', 'geographic information systems', 'mapping',
      'environmental compliance', 'EPA', 'environmental impact',
      'public health', 'community development', 'social services',
      'IT modernization', 'FedRAMP', 'cloud.gov',
      'acquisition', 'contracting officer', 'COR',
    ],
  },

  // -- Biotech & Pharmaceutical ------------------------------------------------
  {
    id: 'biotech',
    name: 'Biotech & Pharmaceutical',
    keywords: [
      'GMP', 'good manufacturing practice', 'cGMP',
      'FDA', 'FDA regulations', 'regulatory submissions',
      'clinical trials', 'clinical research', 'Phase I', 'Phase II', 'Phase III',
      'GLP', 'good laboratory practice', 'GCP', 'good clinical practice',
      'pharmacovigilance', 'adverse events', 'drug safety',
      'CRISPR', 'gene editing', 'genomics', 'proteomics',
      'bioinformatics', 'molecular biology', 'cell biology',
      'drug discovery', 'drug development', 'preclinical',
      'analytical chemistry', 'HPLC', 'mass spectrometry', 'PCR',
      'quality control', 'quality assurance', 'batch records',
      'SOP', 'standard operating procedures', 'documentation',
      'regulatory affairs', 'NDA', 'BLA', 'IND', '510(k)',
      'validation', 'process validation', 'method validation',
      'bioprocessing', 'upstream', 'downstream', 'fermentation',
      'supply chain', 'cold chain', 'logistics',
      'R&D', 'research and development', 'innovation',
      'patent', 'intellectual property', 'technology transfer',
      'medical devices', 'ISO 13485', 'risk management',
    ],
  },

  // -- Hospitality & Food Service ----------------------------------------------
  {
    id: 'hospitality',
    name: 'Hospitality & Food Service',
    keywords: [
      'POS systems', 'point of sale', 'Micros', 'Toast', 'Square',
      'guest relations', 'customer service', 'guest satisfaction',
      'food safety', 'ServSafe', 'food handler', 'sanitation',
      'HACCP', 'hazard analysis', 'critical control points',
      'revenue management', 'yield management', 'occupancy rate',
      'front desk', 'check-in', 'check-out', 'reservations',
      'housekeeping', 'room management', 'property management',
      'PMS', 'property management system', 'Opera', 'Marriott FOSSE',
      'banquet management', 'catering', 'event planning',
      'menu development', 'food cost', 'beverage management',
      'staff scheduling', 'labor cost', 'workforce management',
      'upselling', 'cross-selling', 'loyalty programs',
      'TripAdvisor', 'Yelp', 'online reputation management',
      'health department', 'inspections', 'compliance',
      'opening and closing procedures', 'cash handling', 'inventory',
      'fine dining', 'casual dining', 'quick service', 'QSR',
      'concierge', 'valet', 'bell services',
      'hotel management', 'restaurant management', 'bar management',
    ],
  },

  // -- Retail & E-commerce -----------------------------------------------------
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    keywords: [
      'POS', 'point of sale', 'retail operations', 'store management',
      'inventory management', 'stock management', 'shrinkage prevention',
      'visual merchandising', 'planograms', 'store layout',
      'Shopify', 'Magento', 'WooCommerce', 'BigCommerce',
      'omnichannel', 'multichannel', 'click and collect', 'BOPIS',
      'customer experience', 'customer service', 'NPS',
      'loss prevention', 'LP', 'asset protection',
      'supply chain', 'distribution', 'fulfillment', 'warehouse',
      'e-commerce', 'online retail', 'digital commerce',
      'merchandising', 'buying', 'category management',
      'pricing strategy', 'markdown', 'promotional planning',
      'sales analysis', 'same-store sales', 'comp sales', 'revenue',
      'CRM', 'loyalty programs', 'customer retention',
      'Google Analytics', 'conversion rate', 'cart abandonment',
      'social commerce', 'marketplace', 'Amazon seller', 'FBA',
      'product listing', 'SEO', 'product photography',
      'returns management', 'reverse logistics',
      'seasonal planning', 'demand forecasting', 'trend analysis',
    ],
  },

  // -- Construction & Trades ---------------------------------------------------
  {
    id: 'construction',
    name: 'Construction & Trades',
    keywords: [
      'OSHA', 'OSHA compliance', 'safety management', 'safety training',
      'AutoCAD', 'Revit', 'BIM', 'building information modeling',
      'project scheduling', 'Primavera', 'P6', 'Microsoft Project',
      'estimating', 'cost estimating', 'quantity takeoff', 'bidding',
      'blueprints', 'construction drawings', 'specifications',
      'general contracting', 'subcontractor management', 'trade coordination',
      'concrete', 'steel', 'structural', 'foundations',
      'HVAC', 'plumbing', 'electrical', 'mechanical',
      'building codes', 'permitting', 'inspections', 'zoning',
      'project management', 'construction management', 'site management',
      'quality control', 'QC', 'punch list', 'closeout',
      'change orders', 'RFIs', 'submittals', 'procurement',
      'budgeting', 'cost control', 'scheduling', 'critical path',
      'LEED', 'green building', 'sustainability', 'energy efficiency',
      'site safety', 'toolbox talks', 'incident reporting',
      'heavy equipment', 'crane operations', 'rigging',
      'surveying', 'grading', 'excavation', 'earthwork',
      'residential', 'commercial', 'industrial', 'infrastructure',
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
