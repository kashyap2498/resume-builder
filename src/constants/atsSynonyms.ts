// =============================================================================
// Resume Builder - ATS Synonym Dictionary
// =============================================================================
// ~200 canonical entries with ~500 total forms. Every form maps to all its
// siblings so synonym resolution is O(1) via SYNONYM_MAP.

// Each entry: [canonical, [canonical, ...alternates]]
const SYNONYM_ENTRIES: [string, string[]][] = [
  // -- Programming Languages ---------------------------------------------------
  ['javascript', ['javascript', 'js', 'ecmascript', 'es6', 'es2015']],
  ['typescript', ['typescript', 'ts']],
  ['python', ['python', 'py']],
  ['c++', ['c++', 'cpp', 'cplusplus']],
  ['c#', ['c#', 'csharp', 'c sharp']],
  ['golang', ['golang', 'go']],
  ['ruby', ['ruby', 'rb']],
  ['kotlin', ['kotlin', 'kt']],
  ['objective-c', ['objective-c', 'objc', 'objective c']],
  ['swift', ['swift', 'swiftlang']],
  ['r', ['r', 'r language', 'r programming']],
  ['visual basic', ['visual basic', 'vb', 'vb.net', 'vba']],
  ['assembly', ['assembly', 'asm', 'assembly language']],
  ['perl', ['perl', 'pl']],
  ['scala', ['scala', 'sc']],
  ['haskell', ['haskell', 'hs']],
  ['elixir', ['elixir', 'ex']],

  // -- Frontend Frameworks / Libraries -----------------------------------------
  ['react', ['react', 'reactjs', 'react.js']],
  ['angular', ['angular', 'angularjs', 'angular.js']],
  ['vue', ['vue', 'vuejs', 'vue.js']],
  ['next.js', ['next.js', 'nextjs', 'next']],
  ['nuxt', ['nuxt', 'nuxtjs', 'nuxt.js']],
  ['svelte', ['svelte', 'sveltejs']],
  ['jquery', ['jquery', 'jq']],
  ['ember', ['ember', 'emberjs', 'ember.js']],
  ['backbone', ['backbone', 'backbonejs', 'backbone.js']],

  // -- Backend Frameworks ------------------------------------------------------
  ['node.js', ['node.js', 'nodejs', 'node']],
  ['express', ['express', 'expressjs', 'express.js']],
  ['django', ['django', 'dj']],
  ['flask', ['flask', 'flask python']],
  ['spring', ['spring', 'spring boot', 'springboot']],
  ['ruby on rails', ['ruby on rails', 'rails', 'ror']],
  ['asp.net', ['asp.net', 'aspnet', 'asp .net', 'dotnet']],
  ['fastapi', ['fastapi', 'fast api']],
  ['laravel', ['laravel', 'php laravel']],

  // -- Databases ---------------------------------------------------------------
  ['postgresql', ['postgresql', 'postgres', 'psql', 'pg']],
  ['mysql', ['mysql', 'my sql']],
  ['mongodb', ['mongodb', 'mongo']],
  ['microsoft sql server', ['microsoft sql server', 'mssql', 'sql server', 'ms sql']],
  ['dynamodb', ['dynamodb', 'dynamo db', 'aws dynamodb']],
  ['cassandra', ['cassandra', 'apache cassandra']],
  ['elasticsearch', ['elasticsearch', 'elastic search', 'es']],
  ['redis', ['redis', 'redis cache']],
  ['sqlite', ['sqlite', 'sqlite3']],
  ['oracle database', ['oracle database', 'oracle db', 'oracle']],
  ['couchdb', ['couchdb', 'couch db', 'apache couchdb']],

  // -- Cloud Platforms ---------------------------------------------------------
  ['amazon web services', ['amazon web services', 'aws']],
  ['google cloud platform', ['google cloud platform', 'gcp', 'google cloud']],
  ['microsoft azure', ['microsoft azure', 'azure']],
  ['heroku', ['heroku', 'heroku cloud']],
  ['digitalocean', ['digitalocean', 'digital ocean']],
  ['cloudflare', ['cloudflare', 'cloud flare']],

  // -- DevOps / Infrastructure -------------------------------------------------
  ['kubernetes', ['kubernetes', 'k8s']],
  ['docker', ['docker', 'docker container', 'containerization']],
  ['terraform', ['terraform', 'hashicorp terraform']],
  ['ansible', ['ansible', 'ansible automation']],
  ['jenkins', ['jenkins', 'jenkins ci']],
  ['github actions', ['github actions', 'gh actions', 'gha']],
  ['gitlab ci', ['gitlab ci', 'gitlab ci/cd', 'gitlab pipeline']],
  ['circleci', ['circleci', 'circle ci']],
  ['continuous integration', ['continuous integration', 'ci']],
  ['continuous delivery', ['continuous delivery', 'continuous deployment', 'cd']],
  ['ci/cd', ['ci/cd', 'cicd', 'ci cd']],
  ['infrastructure as code', ['infrastructure as code', 'iac']],
  ['amazon ec2', ['amazon ec2', 'ec2', 'aws ec2']],
  ['amazon s3', ['amazon s3', 's3', 'aws s3']],
  ['aws lambda', ['aws lambda', 'lambda', 'serverless lambda']],
  ['nginx', ['nginx', 'engine x']],
  ['apache', ['apache', 'apache http', 'httpd']],

  // -- Methodologies -----------------------------------------------------------
  ['agile', ['agile', 'agile methodology', 'agile development']],
  ['scrum', ['scrum', 'scrum framework']],
  ['kanban', ['kanban', 'kanban board']],
  ['waterfall', ['waterfall', 'waterfall methodology']],
  ['test-driven development', ['test-driven development', 'tdd']],
  ['behavior-driven development', ['behavior-driven development', 'bdd']],
  ['object-oriented programming', ['object-oriented programming', 'oop']],
  ['functional programming', ['functional programming', 'fp']],
  ['pair programming', ['pair programming', 'pairing']],
  ['extreme programming', ['extreme programming', 'xp']],
  ['devops', ['devops', 'dev ops']],
  ['site reliability engineering', ['site reliability engineering', 'sre']],

  // -- Testing -----------------------------------------------------------------
  ['unit testing', ['unit testing', 'unit tests']],
  ['integration testing', ['integration testing', 'integration tests']],
  ['end-to-end testing', ['end-to-end testing', 'e2e testing', 'e2e']],
  ['jest', ['jest', 'jestjs']],
  ['mocha', ['mocha', 'mochajs']],
  ['cypress', ['cypress', 'cypress.io']],
  ['selenium', ['selenium', 'selenium webdriver']],
  ['playwright', ['playwright', 'ms playwright']],

  // -- Version Control ---------------------------------------------------------
  ['git', ['git', 'git scm']],
  ['github', ['github', 'gh']],
  ['gitlab', ['gitlab', 'git lab']],
  ['bitbucket', ['bitbucket', 'bit bucket']],
  ['subversion', ['subversion', 'svn']],

  // -- Data Science / ML -------------------------------------------------------
  ['machine learning', ['machine learning', 'ml']],
  ['deep learning', ['deep learning', 'dl']],
  ['artificial intelligence', ['artificial intelligence', 'ai']],
  ['natural language processing', ['natural language processing', 'nlp']],
  ['computer vision', ['computer vision', 'cv']],
  ['tensorflow', ['tensorflow', 'tensor flow']],
  ['pytorch', ['pytorch', 'py torch']],
  ['scikit-learn', ['scikit-learn', 'sklearn', 'scikit learn']],
  ['pandas', ['pandas', 'pd']],
  ['numpy', ['numpy', 'np']],
  ['jupyter', ['jupyter', 'jupyter notebook', 'jupyter lab']],
  ['data visualization', ['data visualization', 'data viz', 'dataviz']],
  ['business intelligence', ['business intelligence', 'bi']],
  ['extract transform load', ['extract transform load', 'etl']],
  ['tableau', ['tableau', 'tableau desktop']],
  ['power bi', ['power bi', 'powerbi', 'power business intelligence']],
  ['apache spark', ['apache spark', 'spark', 'pyspark']],
  ['apache kafka', ['apache kafka', 'kafka']],
  ['apache hadoop', ['apache hadoop', 'hadoop', 'hdfs']],

  // -- Certifications ----------------------------------------------------------
  ['aws certified solutions architect', ['aws certified solutions architect', 'aws solutions architect', 'aws sa']],
  ['aws certified developer', ['aws certified developer', 'aws developer']],
  ['certified kubernetes administrator', ['certified kubernetes administrator', 'cka']],
  ['certified scrum master', ['certified scrum master', 'csm']],
  ['project management professional', ['project management professional', 'pmp']],
  ['certified information systems security professional', ['certified information systems security professional', 'cissp']],
  ['certified ethical hacker', ['certified ethical hacker', 'ceh']],
  ['comptia security+', ['comptia security+', 'security+', 'sec+']],
  ['google cloud certified', ['google cloud certified', 'gcp certified']],
  ['azure administrator', ['azure administrator', 'az-104']],
  ['six sigma', ['six sigma', '6 sigma', '6sigma']],
  ['six sigma green belt', ['six sigma green belt', 'green belt', 'ssgb']],
  ['six sigma black belt', ['six sigma black belt', 'black belt', 'ssbb']],

  // -- Design Tools ------------------------------------------------------------
  ['figma', ['figma', 'figma design']],
  ['adobe photoshop', ['adobe photoshop', 'photoshop', 'ps']],
  ['adobe illustrator', ['adobe illustrator', 'illustrator']],
  ['adobe indesign', ['adobe indesign', 'indesign', 'id']],
  ['adobe xd', ['adobe xd', 'xd']],
  ['sketch', ['sketch', 'sketch app']],
  ['invision', ['invision', 'in vision']],

  // -- UX / Design Concepts ----------------------------------------------------
  ['user experience', ['user experience', 'ux']],
  ['user interface', ['user interface', 'ui']],
  ['ui/ux', ['ui/ux', 'ux/ui', 'ui ux', 'ux ui']],
  ['user research', ['user research', 'ux research']],
  ['information architecture', ['information architecture', 'ia']],
  ['search engine optimization', ['search engine optimization', 'seo']],
  ['search engine marketing', ['search engine marketing', 'sem']],

  // -- Project Management / Business -------------------------------------------
  ['project management', ['project management', 'pm']],
  ['product management', ['product management', 'product mgmt']],
  ['objectives and key results', ['objectives and key results', 'okr', 'okrs']],
  ['key performance indicator', ['key performance indicator', 'kpi', 'kpis']],
  ['return on investment', ['return on investment', 'roi']],
  ['customer relationship management', ['customer relationship management', 'crm']],
  ['enterprise resource planning', ['enterprise resource planning', 'erp']],
  ['business-to-business', ['business-to-business', 'b2b']],
  ['business-to-consumer', ['business-to-consumer', 'b2c']],
  ['software as a service', ['software as a service', 'saas']],
  ['minimum viable product', ['minimum viable product', 'mvp']],
  ['product requirements document', ['product requirements document', 'prd']],
  ['jira', ['jira', 'atlassian jira']],
  ['confluence', ['confluence', 'atlassian confluence']],
  ['asana', ['asana', 'asana pm']],
  ['trello', ['trello', 'trello board']],
  ['monday.com', ['monday.com', 'monday']],

  // -- Communication / Messaging -----------------------------------------------
  ['application programming interface', ['application programming interface', 'api']],
  ['rest api', ['rest api', 'restful api', 'rest', 'restful']],
  ['graphql', ['graphql', 'graph ql']],
  ['websocket', ['websocket', 'web socket', 'ws']],
  ['grpc', ['grpc', 'g rpc']],

  // -- Security ----------------------------------------------------------------
  ['single sign-on', ['single sign-on', 'sso']],
  ['multi-factor authentication', ['multi-factor authentication', 'mfa', '2fa', 'two-factor authentication']],
  ['json web token', ['json web token', 'jwt']],
  ['oauth', ['oauth', 'oauth2', 'oauth 2.0']],
  ['security information and event management', ['security information and event management', 'siem']],
  ['nist', ['nist', 'nist framework', 'nist cybersecurity framework']],
  ['iso 27001', ['iso 27001', 'iso27001']],
  ['soc 2', ['soc 2', 'soc2', 'soc 2 type ii']],
  ['penetration testing', ['penetration testing', 'pen testing', 'pentest']],

  // -- Healthcare Terms --------------------------------------------------------
  ['electronic health records', ['electronic health records', 'ehr']],
  ['electronic medical records', ['electronic medical records', 'emr']],
  ['health insurance portability and accountability act', ['health insurance portability and accountability act', 'hipaa']],
  ['international classification of diseases', ['international classification of diseases', 'icd', 'icd-10']],
  ['current procedural terminology', ['current procedural terminology', 'cpt']],
  ['basic life support', ['basic life support', 'bls']],
  ['advanced cardiovascular life support', ['advanced cardiovascular life support', 'acls']],
  ['good manufacturing practice', ['good manufacturing practice', 'gmp', 'cgmp']],
  ['good laboratory practice', ['good laboratory practice', 'glp']],
  ['food and drug administration', ['food and drug administration', 'fda']],

  // -- Finance Terms -----------------------------------------------------------
  ['discounted cash flow', ['discounted cash flow', 'dcf']],
  ['mergers and acquisitions', ['mergers and acquisitions', 'm&a', 'mergers & acquisitions']],
  ['initial public offering', ['initial public offering', 'ipo']],
  ['financial modeling', ['financial modeling', 'financial modelling']],
  ['generally accepted accounting principles', ['generally accepted accounting principles', 'gaap']],
  ['international financial reporting standards', ['international financial reporting standards', 'ifrs']],
  ['certified public accountant', ['certified public accountant', 'cpa']],
  ['chartered financial analyst', ['chartered financial analyst', 'cfa']],

  // -- Legal Terms -------------------------------------------------------------
  ['intellectual property', ['intellectual property', 'ip']],
  ['non-disclosure agreement', ['non-disclosure agreement', 'nda']],
  ['service level agreement', ['service level agreement', 'sla']],
  ['terms of service', ['terms of service', 'tos']],
  ['freedom of information act', ['freedom of information act', 'foia']],

  // -- Engineering / Manufacturing ---------------------------------------------
  ['computer-aided design', ['computer-aided design', 'cad']],
  ['finite element analysis', ['finite element analysis', 'fea']],
  ['computational fluid dynamics', ['computational fluid dynamics', 'cfd']],
  ['geometric dimensioning and tolerancing', ['geometric dimensioning and tolerancing', 'gd&t']],
  ['failure mode and effects analysis', ['failure mode and effects analysis', 'fmea']],
  ['design for manufacturing', ['design for manufacturing', 'dfm']],
  ['bill of materials', ['bill of materials', 'bom']],
  ['product lifecycle management', ['product lifecycle management', 'plm']],
  ['programmable logic controller', ['programmable logic controller', 'plc']],
  ['occupational safety and health administration', ['occupational safety and health administration', 'osha']],
  ['hazard analysis critical control points', ['hazard analysis critical control points', 'haccp']],

  // -- Soft Skills -------------------------------------------------------------
  ['communication skills', ['communication skills', 'communication']],
  ['problem solving', ['problem solving', 'problem-solving']],
  ['critical thinking', ['critical thinking', 'analytical thinking']],
  ['time management', ['time management', 'time-management']],
  ['cross-functional', ['cross-functional', 'cross functional']],
  ['stakeholder management', ['stakeholder management', 'stakeholder engagement']],
  ['change management', ['change management', 'change mgmt']],
];

// -- Soft Skill Canonicals ----------------------------------------------------
// ~50 canonical soft skill terms for hard/soft skill classification.
// Uses canonical forms from the synonym dictionary where available.

export const SOFT_SKILL_CANONICALS = new Set<string>([
  'communication skills',
  'problem solving',
  'critical thinking',
  'time management',
  'cross-functional',
  'stakeholder management',
  'change management',
  'leadership',
  'teamwork',
  'collaboration',
  'adaptability',
  'negotiation',
  'mentoring',
  'coaching',
  'conflict resolution',
  'decision making',
  'emotional intelligence',
  'empathy',
  'creativity',
  'innovation',
  'flexibility',
  'self-motivation',
  'work ethic',
  'interpersonal skills',
  'presentation skills',
  'public speaking',
  'active listening',
  'persuasion',
  'relationship building',
  'networking',
  'delegation',
  'strategic thinking',
  'analytical skills',
  'attention to detail',
  'organizational skills',
  'multitasking',
  'prioritization',
  'accountability',
  'initiative',
  'resilience',
  'patience',
  'cultural awareness',
  'customer service',
  'team building',
  'facilitation',
  'written communication',
  'verbal communication',
  'influence',
  'dependability',
  'professionalism',
]);

// -- Build the lookup map -----------------------------------------------------

export const SYNONYM_MAP = new Map<string, string[]>();

for (const [, forms] of SYNONYM_ENTRIES) {
  const lowerForms = forms.map((f) => f.toLowerCase());
  for (const form of lowerForms) {
    SYNONYM_MAP.set(form, lowerForms);
  }
}

/**
 * Given any form (e.g. "js"), returns all equivalent forms
 * (e.g. ["javascript", "js", "ecmascript", "es6", "es2015"]).
 * Returns a single-element array with the input if no synonyms are known.
 */
export function resolveSynonyms(keyword: string): string[] {
  const lower = keyword.toLowerCase();
  return SYNONYM_MAP.get(lower) ?? [lower];
}

/**
 * Returns the canonical (first) form for a given keyword.
 * E.g. getCanonicalForm("js") → "javascript"
 */
export function getCanonicalForm(keyword: string): string {
  const lower = keyword.toLowerCase();
  const group = SYNONYM_MAP.get(lower);
  return group ? group[0] : lower;
}

/**
 * Returns the set of all known multi-word phrases in the synonym dictionary.
 * Useful for validating n-gram extraction.
 */
export function getKnownPhrases(): Set<string> {
  const phrases = new Set<string>();
  for (const [, forms] of SYNONYM_ENTRIES) {
    for (const form of forms) {
      if (form.includes(' ') || form.includes('-')) {
        phrases.add(form.toLowerCase());
      }
    }
  }
  return phrases;
}
