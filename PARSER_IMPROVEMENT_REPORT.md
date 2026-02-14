# Resume Parser: Comprehensive Improvement Report

## Executive Summary

This report provides a deep technical analysis of the current resume parser in `src/utils/resumeParser.ts` and its supporting pipeline (`pdfParser.ts`, `docxParser.ts`, `useFileImport.ts`). After auditing every line of parsing logic, testing edge cases, and researching how industry leaders (Textkernel/Sovren, Daxtra, Affinda, HireAbility) build their parsers, this document identifies **38 specific weaknesses** across 8 categories and provides prioritized, actionable implementation plans for each.

The current parser is a solid heuristic foundation (~743 lines) that handles well-formatted, single-column, English-language resumes with standard section headings. However, it will fail partially or completely on roughly 40-60% of real-world resumes due to the issues documented below.

---

## Table of Contents

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [Critical Failures: Will Lose User Data](#2-critical-failures-will-lose-user-data)
3. [Major Gaps: Missing Section Parsers](#3-major-gaps-missing-section-parsers)
4. [PDF Extraction Layer Weaknesses](#4-pdf-extraction-layer-weaknesses)
5. [Contact Extraction Weaknesses](#5-contact-extraction-weaknesses)
6. [Experience Parser Weaknesses](#6-experience-parser-weaknesses)
7. [Education Parser Weaknesses](#7-education-parser-weaknesses)
8. [Skills Parser Weaknesses](#8-skills-parser-weaknesses)
9. [Form-Parser Alignment Issues](#9-form-parser-alignment-issues)
10. [Architectural Improvements](#10-architectural-improvements)
11. [Implementation Priority Matrix](#11-implementation-priority-matrix)

---

## 1. Current Architecture Overview

### Pipeline Flow

```
File Upload (PDF/DOCX/JSON)
  → useFileImport.ts (orchestrator)
    → pdfParser.ts (pdfjs-dist) OR docxParser.ts (mammoth)
      → Raw text string
        → resumeParser.ts::parseResumeText()
          → Partial<ResumeData>
            → sanitize.ts::sanitizeResumeData()
              → ImportPreview.tsx (user review)
                → ImportModal.tsx::handleApplyData()
                  → resumeStore (Zustand)
```

### What Currently Works

- Basic contact extraction (email, phone, LinkedIn, GitHub, name)
- Section detection for 11 heading types with decorator stripping
- Experience parsing with paragraph-split and date-anchored splitting
- Education parsing with degree keyword detection
- Skills parsing with `Category: items` format
- Certification parsing with name/issuer/date/credentialId
- Hobbies/interests as comma-separated list
- Implicit summary detection (text between contact and first section)
- Unicode bullet character support
- HTML sanitization via DOMPurify

### What the Parser Produces vs. What the Form Accepts

| Form Section | Parser Produces? | Notes |
|---|---|---|
| Contact (10 fields) | **Partial** | Missing: location, website, portfolio, title |
| Summary | Yes | |
| Experience | Yes | |
| Education | Yes | |
| Skills | Yes | |
| Projects | **No** | Section heading detected but never parsed |
| Certifications | Yes | |
| Languages | **No** | Section heading detected but never parsed |
| Volunteer | **No** | Section heading detected but never parsed |
| Awards | **No** | Section heading detected but never parsed |
| Publications | **No** | Section heading detected but never parsed |
| References | **No** | Section heading detected but never parsed |
| Hobbies | Yes | Via "interests" heading |
| Affiliations | **No** | No heading detection at all |
| Courses | **No** | No heading detection at all |
| Custom Sections | **No** | No handling at all |

---

## 2. Critical Failures: Will Lose User Data

These are issues that will cause the parser to **silently drop entire sections** of a user's resume.

### 2.1 Six Detected Sections Are Never Parsed

**File**: `src/utils/resumeParser.ts:680-715` (the `switch` block)

The `SECTION_HEADINGS` map on line 43-60 detects 11 section types, but the `switch` statement on line 680 only handles 6 of them: `summary`, `experience`, `education`, `skills`, `certifications`, and `interests`.

**Sections detected but silently dropped:**
- `projects` — Heading regex exists on line 50, but no `case 'projects'` in the switch
- `languages` — Heading regex exists on line 53, but no `case 'languages'`
- `volunteer` — Heading regex exists on line 55, but no `case 'volunteer'`
- `awards` — Heading regex exists on line 56, but no `case 'awards'`
- `publications` — Heading regex exists on line 57, but no `case 'publications'`
- `references` — Heading regex exists on line 58, but no `case 'references'`

**Impact**: A user uploads a resume with a "Projects" section containing 5 projects, a "Languages" section with 3 languages, and a "Volunteer" section. All of this data is detected as sections but then thrown away in the switch's `default: break`.

**Fix**: Implement `extractProjects()`, `extractLanguages()`, `extractVolunteer()`, `extractAwards()`, `extractPublications()`, and `extractReferences()` functions and wire them into the switch block. Each follows the same pattern as `extractCertifications()` — split into blocks, extract fields per block.

### 2.2 Two-Column/Sidebar PDF Layouts Produce Garbled Text

**File**: `src/utils/pdfParser.ts:32-53`

The PDF parser groups text items by Y-coordinate (within 3-unit threshold) and sorts left-to-right within each line. This works for single-column layouts, but for two-column resumes (which account for 8 of the 18 templates in this app), the extraction **interleaves content from both columns on each line**.

Example: A resume with skills in a left sidebar and experience on the right produces:

```
JavaScript    Senior Developer at Google
Python        Jan 2020 - Present
React         Led team of 8 engineers
```

Instead of the correct reading:

```
JavaScript, Python, React
...
Senior Developer at Google
Jan 2020 - Present
Led team of 8 engineers
```

**Impact**: Two-column resume imports will produce nearly unusable results. The heuristic parser downstream will be unable to detect sections or extract structured data from interleaved text.

**Fix**: Implement column detection in `pdfParser.ts`:
1. After collecting all text items, analyze the X-coordinate distribution to detect column boundaries (look for a bimodal distribution with a gap in the middle)
2. If columns are detected, partition text items into left and right groups
3. Extract each column independently (sort by Y within each column)
4. Concatenate: left column text first, then right column text
5. This can be done with a clustering algorithm on X positions or by detecting the gap between the two densest X regions

### 2.3 ImportModal Only Applies 6 of 16 Section Types

**File**: `src/components/import/ImportModal.tsx:142-193` (`handleApplyData`)

Even if the parser were to extract all section types, the `handleApplyData` function only merges: `contact`, `summary`, `experience`, `education`, `skills`, and `certifications`. All other parsed sections (projects, languages, volunteer, awards, publications, references, hobbies, affiliations, courses) are silently dropped during the merge step.

The `sectionDataMap` on line 167-174 also only auto-enables visibility for those same 6 sections.

**Fix**: Extend `handleApplyData` to merge all section types present in `Partial<ResumeData>`:

```typescript
if (data.projects) updatedData.projects = data.projects;
if (data.languages) updatedData.languages = data.languages;
if (data.volunteer) updatedData.volunteer = data.volunteer;
if (data.awards) updatedData.awards = data.awards;
if (data.publications) updatedData.publications = data.publications;
if (data.references) updatedData.references = data.references;
if (data.hobbies) updatedData.hobbies = data.hobbies;
if (data.affiliations) updatedData.affiliations = data.affiliations;
if (data.courses) updatedData.courses = data.courses;
```

And extend `sectionDataMap` accordingly.

### 2.4 ImportPreview Only Shows 6 of 16 Section Types

**File**: `src/components/import/ImportPreview.tsx`

The preview component only displays and allows editing of: contact, summary, experience, education, skills, and certifications. Even if the parser extracted projects, languages, etc., the user would never see them in the preview.

**Fix**: Add preview sections for all parseable section types. Follow the same pattern as the existing certifications section — a collapsible card with editable fields per entry.

---

## 3. Major Gaps: Missing Section Parsers

### 3.1 Projects Parser (Missing)

Projects are extremely common on tech resumes and the form supports: `name`, `description`, `technologies[]`, `url`, `startDate`, `endDate`, `highlights[]`.

**Typical resume formats:**

```
Projects
Personal Portfolio Website
React, TypeScript, Tailwind CSS | https://johndoe.dev
Built a responsive portfolio site with blog integration and dark mode
- Implemented MDX-based blog engine with syntax highlighting
- Deployed on Vercel with CI/CD pipeline
```

**Implementation approach:**
- Split content by paragraph breaks or by lines that contain technology keywords/URLs
- First non-bullet line = project name
- Lines with tech stacks (comma-separated short words) → `technologies[]`
- URLs → `url`
- Date ranges → `startDate`/`endDate`
- Bullet points → `highlights[]`

### 3.2 Languages Parser (Missing)

The form supports: `name`, `proficiency` (enum: native/fluent/advanced/intermediate/beginner).

**Typical resume formats:**

```
Languages
English (Native)
Spanish - Fluent
French: Intermediate
Mandarin (Conversational)
German — B2
```

**Implementation approach:**
- Split by lines
- For each line, extract the language name and proficiency indicator
- Map common proficiency terms to the enum:
  - native/mother tongue → `native`
  - fluent/proficient/C1/C2/professional → `fluent`
  - advanced/B2/upper intermediate → `advanced`
  - intermediate/B1/conversational → `intermediate`
  - beginner/basic/A1/A2/elementary → `beginner`
- Handle multiple separators: parentheses `()`, colon `:`, dash `-/–/—`, pipe `|`

### 3.3 Volunteer Parser (Missing)

Structurally identical to experience. The form supports: `organization`, `role`, `startDate`, `endDate`, `description`, `highlights[]`.

**Fix**: Reuse `extractExperience()` logic with field name mapping (company→organization, position→role).

### 3.4 Awards Parser (Missing)

The form supports: `title`, `issuer`, `date`, `description`.

**Typical formats:**

```
Awards
Employee of the Year, TechCorp, 2023
Dean's List — MIT — Fall 2019, Spring 2020
Best Paper Award | IEEE Conference 2022
```

**Implementation**: Similar to certifications — split by blocks, extract title (first line), issuer (after separator), date (regex match).

### 3.5 Publications Parser (Missing)

The form supports: `title`, `publisher`, `date`, `url`, `description`.

**Typical formats (often academic citation style):**

```
Publications
"Machine Learning in Healthcare" - Journal of AI Research, 2023
Smith, J., Doe, J. (2022). Deep Learning for NLP. IEEE Conference Proceedings.
```

**Implementation**: This is one of the harder sections because of citation format diversity (APA, MLA, IEEE, Chicago). Approach:
- Split by paragraph breaks or numbered list items
- Extract quoted titles or the text before the first separator
- Extract publisher/journal names after the title
- Extract dates with regex
- Extract URLs

### 3.6 References Parser (Missing)

The form supports: `name`, `title`, `company`, `email`, `phone`, `relationship`.

**Typical formats:**

```
References
Jane Smith
Senior Director of Engineering, Google
jane.smith@google.com | (555) 123-4567
Professional reference — Former manager

Available upon request
```

**Implementation**:
- Split by paragraph breaks
- First line → name
- Lines with email/phone → extract those
- Lines with company titles → company + title
- Handle the common "Available upon request" text (skip it or note it)

### 3.7 Missing Section Headings: Affiliations, Courses

The `SECTION_HEADINGS` map has no entries for:
- **Affiliations**: "Professional Affiliations", "Memberships", "Professional Memberships", "Organizations"
- **Courses**: "Courses", "Relevant Coursework", "Professional Development", "Training", "Continuing Education"

**Fix**: Add regex patterns to `SECTION_HEADINGS`:

```typescript
affiliations: /^(?:(?:professional\s*)?affiliations?|memberships?|(?:professional\s*)?organizations?)\s*:?\s*$/i,
courses: /^(?:courses|relevant\s*coursework|coursework|professional\s*development|training|continuing\s*education)\s*:?\s*$/i,
```

---

## 4. PDF Extraction Layer Weaknesses

### 4.1 No OCR Fallback for Image-Based PDFs

**File**: `src/hooks/useFileImport.ts:97-103`

When `extractTextFromPdf()` returns empty text, the hook shows a generic error: "Could not extract any text from the file. The file may be image-based or empty." This is the correct error message, but the experience dead-ends there.

Many resumes are scanned paper documents or exported from design tools (Canva, Figma) as image-based PDFs. Industry-grade parsers use OCR (Tesseract, Google Vision API, AWS Textract) as a fallback.

**Fix options** (in order of complexity):
1. **Minimum**: Improve the error message to explain that the PDF is image-based and suggest the user copy-paste the text manually or re-export from the source application as a text-based PDF
2. **Medium**: Integrate `tesseract.js` (browser-side OCR) as a fallback when text extraction returns empty
3. **Advanced**: Use a cloud OCR service (Google Vision, AWS Textract) for higher accuracy

### 4.2 LINE_THRESHOLD of 3 Units Is Too Tight

**File**: `src/utils/pdfParser.ts:36`

The `LINE_THRESHOLD` of 3 units for grouping text items by Y-coordinate works for standard fonts but fails for:
- Superscript/subscript text (e.g., "1st", "2nd" in dates)
- PDFs generated by different tools that use different unit scales
- Fonts with unusual metrics

Some PDF generators use coordinate systems where a 3-unit threshold represents a tiny fraction of a line height, causing every word to become its own "line."

**Fix**: Make the threshold adaptive. After collecting all text items from a page, compute the actual line height from the most common Y-coordinate gap. Set the threshold to roughly 40-50% of that computed line height.

### 4.3 No Handling of Text Items Without Spaces

**File**: `src/utils/pdfParser.ts:74`

Line 74 joins text items on the same line with a space: `line.items.map((item) => item.str).join(' ')`. However, many PDF generators emit individual characters or word fragments as separate text items, some of which already include trailing spaces. This can produce double-spaced output or, conversely, missing spaces.

**Fix**: Before joining, check the X-coordinate gap between consecutive items. If the gap is less than half a character width, join without space; if greater, join with space. This requires computing an average character width from the text items' width metadata.

### 4.4 Paragraph Threshold Calculation Is Fragile

**File**: `src/utils/pdfParser.ts:59-66`

The median-based paragraph threshold (`medianGap * 1.8`) works for documents with uniform line spacing but breaks on resumes that use different spacing for different sections (e.g., tighter line spacing within bullet points, larger spacing between sections, and even larger spacing between section headings).

**Fix**: Instead of a single threshold, use a multi-threshold approach:
1. Compute the mode (most common gap) for "normal" line spacing
2. Anything > 1.5x the mode = paragraph break
3. Anything > 2.5x the mode = section break (insert two blank lines)

### 4.5 Page Boundaries Don't Preserve Context

**File**: `src/utils/pdfParser.ts:85-88`

Pages are joined with `\n\n`. For resumes that span multiple pages, a section that starts on page 1 and continues on page 2 will have an artificial paragraph break at the page boundary. This can cause the section parser to split an experience entry into two entries.

**Fix**: Instead of always inserting `\n\n` between pages, check if the last line of the previous page and the first line of the next page look like they belong to the same section (e.g., both are bullet points, or the first line of the next page doesn't match a section heading). If so, use just `\n`.

---

## 5. Contact Extraction Weaknesses

### 5.1 No Location Extraction

**File**: `src/utils/resumeParser.ts:110-151`

The `extractContact()` function extracts email, phone, LinkedIn, GitHub, and name — but never extracts `location`. The form has a location field, and most resumes include a city/state or city/country.

**Typical formats:**
```
San Francisco, CA
New York, NY 10001
London, UK
Toronto, ON, Canada
```

**Fix**: Add a location regex that matches common patterns:

```typescript
const LOCATION_REGEX = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b/;
```

This handles "City, ST" format. For international locations, a broader pattern is needed, or extract any line in the first 5 lines that contains a comma but doesn't match email/phone/URL/name patterns.

### 5.2 No Professional Title Extraction

**File**: `src/utils/resumeParser.ts:110-151`

The form has a `title` field ("Software Engineer", "Product Manager", etc.) but the parser never extracts it. On many resumes, the professional title appears directly below the name.

**Typical resume header:**
```
John Doe
Senior Software Engineer
john@example.com | (555) 123-4567
```

**Fix**: After extracting the name from the first few lines, check if the next non-contact line is a short line (< 60 chars) that doesn't match email/phone/URL patterns. This is likely the professional title. Common heuristics:
- Line appears between name and contact info
- Length < 60 characters
- Doesn't contain `@`, phone digits, or URLs
- Often contains keywords like "Engineer", "Manager", "Developer", "Analyst", "Designer", "Director", etc.

### 5.3 No Website/Portfolio Extraction

The parser extracts LinkedIn and GitHub URLs specifically, but never extracts general website or portfolio URLs. The form has both `website` and `portfolio` fields.

**Fix**: After extracting LinkedIn and GitHub URLs, check for any remaining URLs in the first 10 lines. If the URL contains keywords like "portfolio", "behance", "dribbble", "personal", assign it to `portfolio`. Otherwise, assign it to `website`.

### 5.4 Phone Regex Misses International Formats

**File**: `src/utils/resumeParser.ts:21-22`

The `PHONE_REGEX` handles US formats well but misses:
- `+44 20 7946 0958` (UK)
- `+91 98765 43210` (India)
- `+49 30 12345678` (Germany)
- `+86 138 0013 8000` (China)
- `+61 2 1234 5678` (Australia)

**Fix**: Use a more general international phone regex:

```typescript
const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{1,5}\)?[-.\s]?)?\d{2,5}[-.\s]?\d{2,5}(?:[-.\s]?\d{1,5})?/;
```

Or use a validation approach: match anything that looks phone-like (starts with + or (, contains mostly digits and separators, 7-15 total digits) and validate the digit count is between 7 and 15.

### 5.5 Name Extraction Fails on Common Cases

**File**: `src/utils/resumeParser.ts:126-148`

The name extraction logic checks the first 5 lines for a line that is < 50 chars, has no special chars, doesn't start with a digit, and has 2-4 space-separated parts. This fails on:

1. **Names with titles/suffixes**: "Dr. John Doe", "John Doe, PhD", "John Doe Jr."
2. **Names with more than 4 parts**: "María de los Ángeles García" (common in Spanish)
3. **Single-word names**: The code handles this (line 143) but only if it starts with a capital letter — misses cultures with different capitalization
4. **Names on the same line as title**: "John Doe | Software Engineer"
5. **ALL CAPS names**: "JOHN DOE" (common in formal resumes) — the code doesn't specifically handle this but it would pass the check
6. **Names with hyphens**: "Jean-Pierre Dupont" — the `split(/\s+/)` produces 2 parts, which is fine, but "Marie-Claire van der Berg" might produce confusing results

**Fix**:
- Strip common prefixes (Dr., Mr., Mrs., Ms., Prof.) before parsing
- Strip common suffixes (PhD, MD, Jr., Sr., III, CPA, PMP)
- Handle the "Name | Title" and "Name — Title" format by splitting on `|`, `–`, `—` first
- Allow up to 6 parts for international names
- Add explicit ALL CAPS detection (if the line is all uppercase, treat it as a name candidate with high confidence)

### 5.6 Contact Info Searched Across Entire Document

**File**: `src/utils/resumeParser.ts:662-663`

`extractContact(text)` is called with the **full resume text**. This means the first email, phone, LinkedIn, and GitHub URL found anywhere in the document will be extracted as contact info. If a reference's email appears before the candidate's (due to unusual layout or extraction order), it will be used.

**Fix**: Limit contact extraction to the first ~10-15 lines of the document (the header area). If no contact info is found there, then fall back to the full text.

---

## 6. Experience Parser Weaknesses

### 6.1 Company/Position Separator Detection Is Limited

**File**: `src/utils/resumeParser.ts:274-295`

The parser handles "Position at Company" and "Position | Company" formats, plus "Position" on one line and "Company" on the next. But real-world resumes use many more patterns:

**Unhandled formats:**
- `Company — Position` (company first, reversed order)
- `Position, Company` (comma separator)
- `COMPANY NAME\nPosition Title` (company in all caps, then position)
- `Position\nCompany, Location` (three lines)
- `Position | Company | Location` (triple separator)
- `Company (Position)` (parenthetical)

**Fix**: Implement a multi-strategy position/company detector:
1. Try "at" separator → position at company
2. Try `|`, `–`, `—` separator → first part = position, second = company
3. If first line is ALL CAPS and < 40 chars, treat it as company name (many resumes bold/capitalize the company)
4. Try comma separator → but only if the result doesn't look like "City, State"
5. If two clean header lines exist, use heuristics: the line with more common job title words (Engineer, Manager, Developer, Analyst, Director, Lead) = position; the other = company

### 6.2 Location Extraction Is Weak

**File**: `src/utils/resumeParser.ts:287-290`

Location is only extracted when it appears after a `|` or `,` separator in the company line: `Company | Location` or `Company, Location`. But many resumes put location:
- On its own line below company/position
- In parentheses: `Google (Mountain View, CA)`
- After a dash: `Google - San Francisco, CA`
- On the same line as dates: `Jan 2020 - Present, Remote`

**Fix**: After parsing position/company, scan the remaining header lines for location patterns (City, State or City, Country format). Also check within parentheses on the company line.

### 6.3 Date Splitting on Dashes Is Dangerous

**File**: `src/utils/resumeParser.ts:248`

The date range is split using `split(/[-–—]|to/i)`. This will break on:
- Company names with dashes: "Hewlett-Packard" in the same context
- Date formats with dashes: "01-2020" gets split incorrectly on the first dash

For example, "Jan 2020 - Present" correctly splits into ["Jan 2020", "Present"]. But if the date was extracted from a mixed line, the regex could match dashes in other content.

**Fix**: Use a more precise date range extraction. Instead of splitting the raw match, use a regex that captures the two date parts explicitly:

```typescript
/(?:(Jan(?:uary)?|...\d{4})\s*[-–—]\s*(Jan(?:uary)?|...\d{4}|[Pp]resent|[Cc]urrent))/
```

### 6.4 No Handling of Tabular Experience Formats

Some resumes, especially from government/federal contexts, use a tabular format:

```
Company        Position           Dates         Location
Google         Software Engineer  2020-2024     Mountain View, CA
Amazon         SDE II             2018-2020     Seattle, WA
```

The current parser has no concept of tabular data and would treat each line as a single entity.

**Fix**: Detect tabular format by checking if the first line after a section heading has evenly-spaced text regions (consistent column alignment). If detected, parse as a table by using X-coordinate positions to separate columns.

### 6.5 Date Format Normalization Is Missing

The parser extracts dates as raw strings ("January 2020", "01/2020", "2020"). The form's `MonthYearPicker` likely expects a consistent format, but the parser passes through whatever format was in the resume.

**Fix**: After extracting dates, normalize to a consistent format (e.g., "Jan 2020" or "2020-01"):
- "January 2020" → "Jan 2020"
- "01/2020" → "Jan 2020"
- "2020" → "2020"
- "1/2020" → "Jan 2020"

### 6.6 `DATE_RANGE_REGEX` Uses the Global Flag Unsafely

**File**: `src/utils/resumeParser.ts:31-32`

Both `DATE_REGEX` and `DATE_RANGE_REGEX` use the `gi` (global, case-insensitive) flags. Throughout the code, there are manual `lastIndex = 0` resets before each use (e.g., lines 172, 173, 175, 189, 203, etc.). This is fragile — if any usage misses the reset, the regex will start matching from the middle of the string, producing missed matches or false negatives.

The code already has ~20 manual `lastIndex` resets scattered throughout, which is a maintenance hazard.

**Fix**: Remove the `g` flag from these regexes. When you need multiple matches, use `string.match()` or `string.matchAll()` with a locally-created regex. This eliminates the entire class of stale-lastIndex bugs.

---

## 7. Education Parser Weaknesses

### 7.1 Degree Detection Regex Is Too Narrow

**File**: `src/utils/resumeParser.ts:349, 389-391`

The degree pattern only matches: Bachelor, Master, Doctor, Ph.D, B.S., B.A., M.S., M.A., M.B.A., Associate, University, College, Institute, School.

**Missing degree types:**
- `Diploma` / `Advanced Diploma` (common in Australia, India, Canada)
- `Honours` / `Honors` / `Hons` (UK, Australia)
- `Juris Doctor` / `J.D.`
- `Doctor of Medicine` / `M.D.`
- `Doctor of Education` / `Ed.D.`
- `B.Eng.` / `M.Eng.` (Engineering)
- `B.Com.` / `M.Com.` (Commerce, common in India/South Africa)
- `B.Tech.` / `M.Tech.` (Technology, common in India)
- `BBA` (Bachelor of Business Administration)
- `LLB` / `LLM` (Law)
- `BFA` / `MFA` (Fine Arts)
- `BSN` / `MSN` (Nursing)
- `Certificate` / `Professional Certificate`
- `Postgraduate` / `Post-Graduate Diploma`
- `Abitur` (Germany), `Baccalauréat` (France), `Matura` (Central Europe)

**Fix**: Significantly expand the degree pattern:

```typescript
const degreePattern = /(?:Bachelor|Master|Doctor|Ph\.?D|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|B\.?Eng\.?|M\.?Eng\.?|B\.?Tech\.?|M\.?Tech\.?|B\.?Com\.?|M\.?Com\.?|BBA|BFA|MFA|BSN|MSN|LLB|LLM|J\.?D\.?|M\.?D\.?|Ed\.?D\.?|Associate|Diploma|Honours?|Hons\.?|Certificate|Postgraduate|University|College|Institute|School)/i;
```

### 7.2 Institution Name Gets Mangled

**File**: `src/utils/resumeParser.ts:422-435`

When a degree is found inline (e.g., "Bachelor of Science in Computer Science"), the code tries to extract the institution by removing the degree text from the first line. This produces mangled results for lines like:

```
"MIT — Bachelor of Science in Computer Science"
→ institution = "MIT —" (trailing separator)

"Bachelor of Science in CS | University of Michigan"
→ institution = "| University of Michigan" (leading separator)
```

**Fix**: After removing the degree text and date text, also strip leading/trailing separators (`|`, `–`, `—`, `,`, `-`) and whitespace. Also, if the first line IS the degree, look at the second line for the institution.

### 7.3 No Handling of "Expected Graduation" / "Anticipated"

Students and recent graduates often write:

```
Expected May 2025
Anticipated Graduation: December 2024
Expected completion: 2025
```

The current parser doesn't detect these patterns and would either miss the date or incorrectly parse it.

**Fix**: Add expected/anticipated date patterns:

```typescript
const EXPECTED_DATE_REGEX = /(?:expected|anticipated|est\.?)\s*(?:graduation|completion)?:?\s*((?:Jan|Feb|...|Dec)\w*\s+\d{4}|\d{4})/i;
```

### 7.4 Multiple Degrees at Same Institution Not Handled

A common pattern:

```
MIT
Bachelor of Science in Computer Science, 2018
Master of Science in Artificial Intelligence, 2020
```

The current parser would likely merge these into a single education entry because both lines contain degree keywords but they're under a single institution heading.

**Fix**: Within a single block, after finding one degree, check if subsequent lines also match degree patterns. If so, create separate entries, all sharing the same institution.

---

## 8. Skills Parser Weaknesses

### 8.1 No Skill Deduplication

If the same skill appears in multiple categories or is listed multiple times, the parser keeps all duplicates:

```
Programming: JavaScript, TypeScript, React
Frontend: React, HTML, CSS
```

Results in React appearing twice.

**Fix**: After extracting all skills, deduplicate items across categories (keep the first occurrence).

### 8.2 Skill Level/Rating Not Parsed

Some resumes include proficiency levels:

```
JavaScript (Expert), Python (Intermediate), Go (Beginner)
React ★★★★★, Angular ★★★☆☆
Java — Advanced, Python — Intermediate
```

The parser currently ignores these and includes the proficiency text as part of the skill name.

**Fix**: Strip proficiency indicators from skill names using regex. While the current `SkillCategory` type doesn't have a proficiency field per-item, at minimum the parenthetical or star-based ratings should be stripped from the skill name.

### 8.3 No Handling of Multi-Line Category Descriptions

Some resumes break categories across multiple lines:

```
Programming Languages:
  JavaScript, TypeScript,
  Python, Go, Rust
```

The current parser only matches "Category: items" when both are on the same line. The continuation lines would be treated as a separate uncategorized group.

**Fix**: When a line matches `Category:` but has no items after the colon (or very few), concatenate subsequent lines until the next category header or blank line.

### 8.4 "Category:" Colon Match Is Too Greedy

**File**: `src/utils/resumeParser.ts:485`

The regex `^(.+?):\s*(.+)$` matches the first colon on the line. This breaks on:
- `C++: Expert` → category = "C++", items = ["Expert"] (wrong — C++ is a skill, not a category)
- `Skills as of 2024: JavaScript, Python` → category = "Skills as of 2024"
- `http://example.com` → incorrectly matched

**Fix**: Maintain a list of common category names (Programming Languages, Frameworks, Tools, Databases, Cloud, DevOps, Soft Skills, etc.) and only treat a colon-match as a category if the left side matches one of these known categories or is a short phrase (< 30 chars) that doesn't look like a skill/URL.

---

## 9. Form-Parser Alignment Issues

### 9.1 Parsed Data Format Doesn't Match Form Expectations

The form uses `MonthYearPicker` components for dates, which likely expects dates in a specific format (e.g., `YYYY-MM` or a `Date` object). The parser outputs raw strings like "Jan 2020", "January 2020", "01/2020", or "2020". If the form can't interpret these raw strings, dates will display incorrectly or be empty.

**Fix**: Add a `normalizeDate()` utility that converts all date formats to whatever the `MonthYearPicker` expects. Call this on all parsed date fields before returning from `parseResumeText()`.

### 9.2 Education "field" Extraction Is Incomplete

**File**: `src/utils/resumeParser.ts:438-443`

The field of study is only extracted from `in X` or `of X` patterns in the degree string:
- "Bachelor of Science **in Computer Science**" → field = "Computer Science"
- "B.S. Computer Science" → field = "" (missed, no "in" or "of")
- "Bachelor of Arts, English Literature" → field = "" (comma separator, not "in")

**Fix**: After the "in/of" match fails, try:
1. Everything after the degree type and "of Science"/"of Arts": `B.S. Computer Science` → "Computer Science"
2. Text after a comma in the degree: `BA, English Literature` → "English Literature"
3. Text on a separate line that doesn't match institution/date patterns

### 9.3 Hobbies Are Parsed But Only Half-Applied

The parser extracts hobbies (interests section) as `{ items: string[] }`, but `handleApplyData` in ImportModal.tsx doesn't have a case for hobbies. So hobbies are parsed but never applied to the resume.

**Fix**: Add `if (data.hobbies) updatedData.hobbies = data.hobbies;` to `handleApplyData` and add `hobbies` to the `sectionDataMap`.

---

## 10. Architectural Improvements

### 10.1 Add Confidence Scoring

Industry parsers return confidence scores with each extracted field. The current parser returns data with no indication of how confident it is.

**Implementation**: Add an optional `confidence` field to the parse result:

```typescript
interface ParseResult {
  data: Partial<ResumeData>;
  confidence: {
    overall: number;  // 0-1
    contact: number;
    experience: number;
    education: number;
    skills: number;
    // ...per section
  };
  warnings: string[];  // Human-readable issues detected
}
```

**Confidence heuristics:**
- Did we find a name? (+0.1)
- Did we find an email? (+0.1)
- Did we detect at least one section heading? (+0.2)
- Are experience entries well-formed (have both position and company)? (+0.1 per entry)
- Were there unrecognized sections (text between headings that didn't match any pattern)? (-0.1 per section)

Display confidence in the ImportPreview as a colored indicator. Warn users when confidence is low.

### 10.2 Add an "Unrecognized Content" Section

When text between section headings doesn't match any known section type, or when text before the first section heading is too long for a summary, this content is silently dropped.

**Fix**: Collect all unrecognized text into a "raw unmatched content" field and display it in the ImportPreview. This lets users manually review and place content the parser couldn't handle. This is critical for non-standard section headings ("My Journey", "What I Do", "Tech Stack", etc.).

### 10.3 Normalize Non-Standard Section Headings

The current heading regex handles 13-15 common variations per section type. But real-world resumes use creative headings:

| Non-standard Heading | Should Map To |
|---|---|
| "Where I've Worked" | experience |
| "My Journey" | experience |
| "Tech Stack" | skills |
| "What I Know" | skills |
| "Toolbox" | skills |
| "Talks & Conferences" | publications |
| "Side Projects" | projects |
| "Giving Back" | volunteer |
| "Learning" | education |
| "Relevant Experience" | experience (already handled) |
| "Leadership" | experience or volunteer |

**Fix options:**
1. **Expand regex patterns** with more creative headings
2. **Fuzzy matching**: If a heading doesn't match any pattern, compute Levenshtein distance to known headings and accept if the distance is below a threshold
3. **Keyword-based fallback**: If the heading contains a strong keyword ("work", "job", "employ" → experience; "school", "degree", "university" → education), classify by keyword presence

### 10.4 Add LinkedIn PDF Export Detection

LinkedIn PDF exports have a distinctive structure (name at top, "Contact" as first section with the LinkedIn URL, "Top Skills" section instead of "Skills", "Summary" section, "Experience" section). Many users will import LinkedIn exports.

**Fix**: Detect LinkedIn format by checking for the "Top Skills" heading and/or "linkedin.com" in the first few lines. If detected, use a LinkedIn-specific parsing strategy that handles its quirks:
- "Top Skills" → skills section
- Contact section format is different (LinkedIn-specific labels)
- "Summary" section is present
- "Honors-Awards" instead of "Awards"

### 10.5 Add a Pre-Processing / Text Cleanup Step

Before section detection, clean the extracted text:

1. **Normalize Unicode**: Convert smart quotes to straight quotes, em-dashes to regular dashes, non-breaking spaces to regular spaces
2. **Remove page numbers**: Strip lines that are just a number (e.g., "1", "2", "Page 1 of 3")
3. **Remove headers/footers that repeat across pages**: If the same short line appears at the same relative position on multiple pages, it's likely a header/footer
4. **Collapse excessive whitespace**: Multiple blank lines → max 2 blank lines
5. **Strip trailing whitespace on all lines**

### 10.6 Consider an LLM-Assisted Parsing Option

For users who opt in, the most significant accuracy improvement would come from sending the extracted text to an LLM (since this app already has a Convex backend) with a structured output schema. This would:

- Handle creative section headings without regex
- Correctly parse complex experience formats
- Understand context (is "Go" a skill or a verb?)
- Handle international resume formats
- Resolve ambiguous position/company ordering

**Implementation approach:**
1. Keep the current heuristic parser as the default (no cost, instant, works offline)
2. Add an optional "AI-Assisted Parse" button that sends the raw text to a Convex action
3. The action calls an LLM with a system prompt defining the exact `ResumeData` schema
4. Return the structured JSON and display in ImportPreview

This is what Textkernel, Affinda, and others are moving toward — hybrid systems where heuristics do the first pass and LLMs handle ambiguity.

---

## 11. Implementation Priority Matrix

### Tier 1: Critical (Fix Immediately — Users Are Losing Data)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 2.1 | Wire up 6 detected-but-dropped sections in switch block | Medium | High |
| 2.3 | Extend ImportModal to apply all section types | Low | High |
| 2.4 | Extend ImportPreview to show all section types | Medium | High |
| 3.7 | Add affiliations/courses section heading detection | Low | Medium |
| 9.3 | Apply parsed hobbies in handleApplyData | Low | Medium |

### Tier 2: High Priority (Significant Accuracy Improvements)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 2.2 | Two-column PDF layout detection and extraction | High | Very High |
| 3.1 | Implement Projects parser | Medium | High |
| 3.2 | Implement Languages parser | Low | High |
| 3.3 | Implement Volunteer parser (reuse experience logic) | Low | Medium |
| 5.1 | Add location extraction | Medium | High |
| 5.2 | Add professional title extraction | Medium | High |
| 5.5 | Fix name extraction for edge cases | Medium | Medium |
| 6.1 | Expand company/position separator detection | Medium | High |
| 6.6 | Remove `g` flag from DATE_REGEX to eliminate lastIndex bugs | Low | Medium |

### Tier 3: Important (Better Parsing Accuracy)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 3.4 | Implement Awards parser | Low | Medium |
| 3.5 | Implement Publications parser | Medium | Medium |
| 3.6 | Implement References parser | Low | Medium |
| 4.1 | Add OCR fallback or better error guidance | Medium-High | Medium |
| 4.2 | Adaptive LINE_THRESHOLD in PDF parser | Medium | Medium |
| 4.4 | Multi-threshold paragraph detection | Medium | Medium |
| 5.3 | Add website/portfolio URL extraction | Low | Medium |
| 5.4 | Expand phone regex for international formats | Low | Medium |
| 5.6 | Limit contact search to header area | Low | Medium |
| 6.2 | Improve location extraction in experience | Medium | Medium |
| 6.5 | Date format normalization | Medium | Medium |
| 7.1 | Expand degree detection regex | Low | High |
| 7.2 | Fix institution name mangling | Low | Medium |
| 9.1 | Normalize parsed dates to form-expected format | Medium | Medium |
| 9.2 | Improve field-of-study extraction | Low | Medium |
| 10.5 | Add text pre-processing/cleanup step | Medium | Medium |

### Tier 4: Polish (Industry-Leading Quality)

| # | Issue | Effort | Impact |
|---|---|---|---|
| 4.3 | Smart space insertion between PDF text items | Medium | Low |
| 4.5 | Smart page boundary handling | Low | Low |
| 6.3 | Safer date range splitting | Medium | Low |
| 6.4 | Tabular experience format detection | High | Low |
| 7.3 | Expected/anticipated graduation date handling | Low | Low |
| 7.4 | Multiple degrees at same institution | Medium | Low |
| 8.1 | Skill deduplication | Low | Low |
| 8.2 | Skill proficiency level stripping | Low | Low |
| 8.3 | Multi-line category support | Medium | Low |
| 8.4 | Smarter "Category:" colon detection | Medium | Low |
| 10.1 | Confidence scoring system | Medium | Medium |
| 10.2 | Unrecognized content collection | Medium | Medium |
| 10.3 | Fuzzy/keyword section heading matching | Medium | Medium |
| 10.4 | LinkedIn PDF export detection | Medium | Medium |
| 10.6 | LLM-assisted parsing option | High | Very High |

---

## Summary: Quick Wins (< 1 hour each)

1. Wire 6 sections into the switch block (2.1)
2. Extend `handleApplyData` for all sections (2.3)
3. Add affiliations/courses heading patterns (3.7)
4. Apply hobbies in the import flow (9.3)
5. Implement Languages parser (3.2)
6. Implement Volunteer parser by reusing experience logic (3.3)
7. Remove `g` flag from date regexes (6.6)
8. Expand degree detection regex (7.1)
9. Add website/portfolio extraction (5.3)
10. Limit contact extraction to first 15 lines (5.6)

These 10 changes alone would significantly improve the parser's coverage and eliminate the most common data-loss scenarios.
