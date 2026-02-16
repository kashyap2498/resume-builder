import { describe, it, expect } from 'vitest'
import { parseResumeText } from '@/utils/resumeParser'
import { formatDateRange } from '@/templates/shared/DateRange'

// =============================================================================
// Shared test data
// =============================================================================

const FULL_RESUME_TEXT = `John Doe
john@example.com
555-123-4567
https://www.linkedin.com/in/johndoe

Summary
Experienced software engineer with 5+ years of experience building scalable web applications and leading cross-functional teams.

Experience
Senior Developer at Tech Corp
Jan 2020 - Present
- Led team of 8 engineers
- Developed new dashboard that increased user engagement by 35%

Full Stack Developer at StartupXYZ
Jun 2017 - Dec 2019
- Built RESTful APIs serving 100,000+ daily requests
* Implemented CI/CD pipeline

Education
Bachelor of Science in Computer Science
MIT
2013 - 2017
GPA: 3.8

Skills
Programming: JavaScript, TypeScript, Python
Frameworks: React, Node.js
`

// =============================================================================
// formatDateRange
// =============================================================================

describe('formatDateRange', () => {
  it('should format a normal date range', () => {
    expect(formatDateRange('Jan 2020', 'Dec 2022')).toBe('Jan 2020 - Dec 2022')
  })

  it('should show "Present" for current entries', () => {
    expect(formatDateRange('Jan 2020', '', true)).toBe('Jan 2020 - Present')
  })

  it('should show just "Present" when startDate is empty and current is true', () => {
    expect(formatDateRange('', '', true)).toBe('Present')
  })

  it('should not produce "- Aug 2022" when startDate is empty', () => {
    const result = formatDateRange('', 'Aug 2022')
    expect(result).toBe('Aug 2022')
    expect(result).not.toMatch(/^-/)
  })

  it('should collapse identical start and end into a single date', () => {
    expect(formatDateRange('2022', '2022')).toBe('2022')
  })

  it('should return empty string when both dates are empty', () => {
    expect(formatDateRange('')).toBe('')
    expect(formatDateRange('', '')).toBe('')
  })

  it('should return just the start date when no end date', () => {
    expect(formatDateRange('Jan 2020')).toBe('Jan 2020')
  })

  it('should handle YYYY-MM format conversion', () => {
    expect(formatDateRange('2023-03', '2024-06')).toBe('Mar 2023 - Jun 2024')
  })
})

// =============================================================================
// parseResumeText
// =============================================================================

describe('parseResumeText', () => {
  // ---------------------------------------------------------------------------
  // Contact extraction
  // ---------------------------------------------------------------------------

  describe('contact extraction', () => {
    it('should extract email', () => {
      const result = parseResumeText('Contact me at john@example.com for details.')
      expect(result.contact?.email).toBe('john@example.com')
    })

    it('should extract phone number', () => {
      const result = parseResumeText('Phone: 555-123-4567\nSome other line')
      expect(result.contact?.phone).toBe('555-123-4567')
    })

    it('should extract first and last name', () => {
      const result = parseResumeText('John Doe\njohn@example.com\n555-123-4567')
      expect(result.contact?.firstName).toBe('John')
      expect(result.contact?.lastName).toBe('Doe')
    })

    it('should extract a three-part name', () => {
      const result = parseResumeText('John Michael Doe\njohn@example.com')
      expect(result.contact?.firstName).toBe('John')
      expect(result.contact?.lastName).toBe('Michael Doe')
    })

    it('should extract LinkedIn URL', () => {
      const result = parseResumeText(
        'John Doe\nhttps://www.linkedin.com/in/johndoe\njohn@example.com'
      )
      expect(result.contact?.linkedin).toMatch(/linkedin\.com\/in\/johndoe/)
    })

    it('should extract GitHub URL', () => {
      const result = parseResumeText(
        'John Doe\nhttps://github.com/johndoe\njohn@example.com'
      )
      expect(result.contact?.github).toMatch(/github\.com\/johndoe/)
    })

    it('should handle phone with parentheses format', () => {
      const result = parseResumeText('John Doe\n(555) 123-4567')
      expect(result.contact?.phone).toBe('(555) 123-4567')
    })
  })

  // ---------------------------------------------------------------------------
  // Section detection
  // ---------------------------------------------------------------------------

  describe('section detection', () => {
    it('should detect standard section headings', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      expect(result.summary).toBeDefined()
      expect(result.experience).toBeDefined()
      expect(result.education).toBeDefined()
      expect(result.skills).toBeDefined()
    })

    it('should detect "Work Experience" heading', () => {
      const text = `John Doe\njohn@example.com\n\nWork Experience\nDeveloper at ACME\nJan 2020 - Present\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience).toBeDefined()
      expect(result.experience!.length).toBe(1)
    })

    it('should detect "Professional Experience" heading', () => {
      const text = `John Doe\njohn@example.com\n\nProfessional Experience\nDeveloper at ACME\nJan 2020 - Present\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience).toBeDefined()
      expect(result.experience!.length).toBe(1)
    })

    it('should detect "Technical Skills" heading', () => {
      const text = `John Doe\njohn@example.com\n\nTechnical Skills\nLanguages: Python, Java`
      const result = parseResumeText(text)
      expect(result.skills).toBeDefined()
      expect(result.skills!.length).toBeGreaterThanOrEqual(1)
    })

    it('should detect "Core Competencies" heading', () => {
      const text = `John Doe\njohn@example.com\n\nCore Competencies\nLeadership, Project Management, Agile`
      const result = parseResumeText(text)
      expect(result.skills).toBeDefined()
    })

    it('should detect heading with trailing colon', () => {
      const text = `John Doe\njohn@example.com\n\nExperience:\nDeveloper at ACME\nJan 2020 - Present\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience).toBeDefined()
    })

    it('should detect heading with decorators like dashes', () => {
      const text = `John Doe\njohn@example.com\n\n--- Experience ---\nDeveloper at ACME\nJan 2020 - Present\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Experience — happy path
  // ---------------------------------------------------------------------------

  describe('experience - happy path', () => {
    it('should parse two entries separated by blank lines', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      expect(result.experience!.length).toBe(2)

      const first = result.experience![0]
      expect(first.position).toMatch(/Senior Developer/i)
      expect(first.company).toMatch(/Tech Corp/i)
      expect(first.current).toBe(true)
      expect(first.highlights.length).toBe(2)

      const second = result.experience![1]
      expect(second.position).toMatch(/Full Stack Developer/i)
      expect(second.company).toMatch(/StartupXYZ/i)
      expect(second.highlights.length).toBe(2)
    })

    it('should strip bullet prefixes from highlights', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      const allHighlights = result.experience!.flatMap((exp) => exp.highlights)
      for (const h of allHighlights) {
        expect(h).not.toMatch(/^[-*\u2022]\s/)
      }
      expect(allHighlights.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse "Position at Company" format', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nSoftware Engineer at Google\nJan 2020 - Present\n- Built services`
      const result = parseResumeText(text)
      expect(result.experience![0].position).toBe('Software Engineer')
      expect(result.experience![0].company).toBe('Google')
    })

    it('should parse "Position | Company" format', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nSoftware Engineer | Google\nJan 2020 - Present\n- Built services`
      const result = parseResumeText(text)
      expect(result.experience![0].position).toBe('Software Engineer')
      expect(result.experience![0].company).toBe('Google')
    })

    it('should parse position and company on separate lines', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nSoftware Engineer\nGoogle\nJan 2020 - Present\n- Built services`
      const result = parseResumeText(text)
      expect(result.experience![0].position).toBe('Software Engineer')
      expect(result.experience![0].company).toBe('Google')
    })

    it('should handle "Current" as end date', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nDeveloper at ACME\nJan 2020 - Current\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience![0].current).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Experience — edge cases (real-world bugs)
  // ---------------------------------------------------------------------------

  describe('experience - edge cases', () => {
    it('should NOT split bullet points as separate job entries', () => {
      // Bug: bullets were treated as new entries when no blank lines
      const text = `John Doe\njohn@example.com\n\nExperience
Software Engineer at Google
Jan 2020 - Present
- Built microservices architecture
- Reduced latency by 40%
- Led team of 5 engineers
- Implemented CI/CD pipeline`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(1)
      expect(result.experience![0].highlights.length).toBe(4)
    })

    it('should detect 3 jobs without blank lines when dates exist', () => {
      // Bug: 3rd job merged into 2nd's bullet points
      const text = `John Doe\njohn@example.com\n\nExperience
Senior Engineer at Company A
Jan 2022 - Present
- Led architecture redesign
- Mentored junior developers
Software Engineer at Company B
Jun 2020 - Dec 2021
- Built REST APIs
- Managed databases
Junior Developer at Company C
Jan 2019 - May 2020
- Wrote unit tests
- Fixed production bugs`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(3)
      expect(result.experience![0].company).toMatch(/Company A/i)
      expect(result.experience![1].company).toMatch(/Company B/i)
      expect(result.experience![2].company).toMatch(/Company C/i)
    })

    it('should detect 3 jobs when date is on a separate line from title', () => {
      const text = `John Doe\njohn@example.com\n\nExperience
Senior Engineer at Company A
Jan 2022 - Present
- Led architecture
Developer at Company B
Jun 2020 - Dec 2021
- Built APIs
Intern at Company C
Jan 2019 - May 2020
- Wrote tests`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(3)
    })

    it('should keep all bullet points with their correct job', () => {
      const text = `John Doe\njohn@example.com\n\nExperience
Manager at Alpha Inc
Jan 2022 - Present
- Managed team of 10
- Increased revenue by 25%
- Launched new product line
Developer at Beta Corp
Jun 2019 - Dec 2021
- Built frontend in React
- Wrote backend in Node.js`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(2)
      expect(result.experience![0].highlights.length).toBe(3)
      expect(result.experience![1].highlights.length).toBe(2)
    })

    it('should handle Unicode bullet characters', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nDeveloper at ACME\nJan 2020 - Present\n\u2022 Built REST APIs\n\u2022 Managed cloud infrastructure`
      const result = parseResumeText(text)
      expect(result.experience![0].highlights.length).toBe(2)
      expect(result.experience![0].highlights[0]).not.toMatch(/^\u2022/)
    })

    it('should handle experience with no bullet points (paragraph description)', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nDeveloper at ACME\nJan 2020 - Present\nResponsible for building and maintaining the core platform services used by millions of users.`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(1)
      // Long non-bullet text after headers should become a highlight
      expect(result.experience![0].highlights.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle date range with full month names', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nDeveloper at ACME\nJanuary 2020 - December 2022\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience![0].startDate).toMatch(/Jan/)
      expect(result.experience![0].endDate).toMatch(/Dec/)
    })

    it('should handle date range with slash format (01/2020)', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nDeveloper at ACME\n01/2020 - 12/2022\n- Built things`
      const result = parseResumeText(text)
      expect(result.experience![0].startDate).toBeTruthy()
      expect(result.experience![0].endDate).toBeTruthy()
    })
  })

  // ---------------------------------------------------------------------------
  // Summary — edge cases
  // ---------------------------------------------------------------------------

  describe('summary', () => {
    it('should extract explicit summary section', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      expect(result.summary?.text).toMatch(/experienced software engineer/i)
    })

    it('should detect "Profile" as summary heading', () => {
      const text = `John Doe\njohn@example.com\n\nProfile\nDedicated professional with 10 years of experience.\n\nExperience\nDeveloper at ACME\nJan 2020 - Present`
      const result = parseResumeText(text)
      expect(result.summary?.text).toMatch(/dedicated professional/i)
    })

    it('should detect "Professional Summary" heading', () => {
      const text = `John Doe\njohn@example.com\n\nProfessional Summary\nResults-driven engineer.\n\nExperience\nDeveloper at ACME\nJan 2020 - Present`
      const result = parseResumeText(text)
      expect(result.summary?.text).toMatch(/results-driven/i)
    })

    it('should NOT treat experience bullet points as summary', () => {
      // Bug: when experience heading wasn't detected, bullets became summary
      const text = `John Doe
john@example.com
555-123-4567

Experience
Senior Developer at Tech Corp
Jan 2020 - Present
- Led team of 8 engineers
- Developed new dashboard that increased user engagement by 35%
- Reduced deployment time by 60%`
      const result = parseResumeText(text)

      // Summary should either be undefined or NOT contain bullet content
      if (result.summary) {
        expect(result.summary.text).not.toMatch(/Led team/)
        expect(result.summary.text).not.toMatch(/Developed new dashboard/)
        expect(result.summary.text).not.toMatch(/Reduced deployment/)
      }

      // The bullet points should be in experience
      expect(result.experience).toBeDefined()
      expect(result.experience![0].highlights.length).toBeGreaterThanOrEqual(1)
    })

    it('should extract implicit summary (text between contact and first section)', () => {
      const text = `John Doe
john@example.com
555-123-4567
https://www.linkedin.com/in/johndoe

Software engineer with expertise in distributed systems and cloud architecture, passionate about building performant applications.

Experience
Developer at ACME
Jan 2020 - Present
- Built things`
      const result = parseResumeText(text)
      expect(result.summary?.text).toMatch(/software engineer/i)
    })
  })

  // ---------------------------------------------------------------------------
  // Education — happy path
  // ---------------------------------------------------------------------------

  describe('education - happy path', () => {
    it('should parse education with degree, institution, date range, and GPA', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      expect(result.education!.length).toBe(1)

      const edu = result.education![0]
      expect(edu.degree).toMatch(/Bachelor/i)
      expect(edu.field).toMatch(/Computer Science/i)
      expect(edu.gpa).toBe('3.8')
    })

    it('should parse multiple education entries separated by blank lines', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
Master of Science in Data Science
Stanford University
2019 - 2021

Bachelor of Science in Computer Science
MIT
2015 - 2019`
      const result = parseResumeText(text)
      expect(result.education!.length).toBe(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Education — edge cases (real-world bugs)
  // ---------------------------------------------------------------------------

  describe('education - edge cases', () => {
    it('should NOT split institution + degree into two entries', () => {
      // Bug: "University of XYZ" + "Bachelor of Science" were split because
      // both lines matched degree/institution keywords
      const text = `John Doe\njohn@example.com\n\nEducation
University of California
Bachelor of Science in Computer Science
Aug 2022`
      const result = parseResumeText(text)
      expect(result.education!.length).toBe(1)

      const edu = result.education![0]
      expect(edu.degree).toMatch(/Bachelor/i)
      // Institution should contain University
      const combined = `${edu.institution} ${edu.degree}`.toLowerCase()
      expect(combined).toContain('university')
    })

    it('should handle single graduation date without producing dash prefix', () => {
      // Bug: single date assigned only to endDate, formatDateRange showed "- Aug 2022"
      const text = `John Doe\njohn@example.com\n\nEducation
MIT
Bachelor of Science in Computer Science
Aug 2022`
      const result = parseResumeText(text)
      const edu = result.education![0]

      // Should have startDate set so formatDateRange works
      expect(edu.endDate).toBeTruthy()
      // formatDateRange should not produce "- date"
      const display = formatDateRange(edu.startDate, edu.endDate)
      expect(display).not.toMatch(/^[\s]*-/)
      expect(display).toBeTruthy()
    })

    it('should handle year-only graduation date', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
MIT
Bachelor of Science in Computer Science
2022`
      const result = parseResumeText(text)
      const edu = result.education![0]
      expect(edu.endDate).toBe('2022')
    })

    it('should handle GPA on same line as other text', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
MIT
Bachelor of Science in CS, GPA: 3.95
2018 - 2022`
      const result = parseResumeText(text)
      expect(result.education![0].gpa).toBe('3.95')
    })

    it('should handle GPA with scale (e.g. 3.8/4.0)', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
MIT\nBS Computer Science\n2018 - 2022\nGPA: 3.8/4.0`
      const result = parseResumeText(text)
      expect(result.education![0].gpa).toBe('3.8')
    })

    it('should parse two education entries without blank lines when both have dates', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
Stanford University
Master of Science in AI
2021 - 2023
MIT
Bachelor of Science in CS
2017 - 2021`
      const result = parseResumeText(text)
      // The splitter should separate these because the first block has a date
      // and the second line has institution keywords
      expect(result.education!.length).toBe(2)
    })

    it('should handle education with bullet point highlights', () => {
      const text = `John Doe\njohn@example.com\n\nEducation
MIT
Bachelor of Science in CS
2018 - 2022
- Dean's List all semesters
- President of CS Club`
      const result = parseResumeText(text)
      expect(result.education![0].highlights.length).toBe(2)
    })

    it('should extract field of study from "in" or "of" pattern', () => {
      const text = `John Doe\njohn@example.com\n\nEducation\nBachelor of Science in Electrical Engineering\nMIT\n2020`
      const result = parseResumeText(text)
      expect(result.education![0].field).toMatch(/Electrical Engineering/i)
    })
  })

  // ---------------------------------------------------------------------------
  // Skills — happy path
  // ---------------------------------------------------------------------------

  describe('skills - happy path', () => {
    it('should parse "Category: skill1, skill2" format', () => {
      const text = `John Doe\njohn@example.com\n\nSkills\nProgramming: JavaScript, TypeScript, Python\nTools: Git, Docker`
      const result = parseResumeText(text)

      expect(result.skills!.length).toBe(2)
      const names = result.skills!.map((c) => c.category.toLowerCase())
      expect(names).toContain('programming')
      expect(names).toContain('tools')
    })

    it('should extract all skill items from comma-separated list', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)
      const allSkills = result.skills!.flatMap((c) =>
        c.items.map((i) => i.toLowerCase())
      )
      expect(allSkills).toEqual(
        expect.arrayContaining(['javascript', 'typescript', 'python'])
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Skills — edge cases (real-world bugs)
  // ---------------------------------------------------------------------------

  describe('skills - edge cases', () => {
    it('should NOT split skills with hyphens as category separators', () => {
      // Bug: "CI/CD" or "Self-motivated" were split by the old regex
      // that matched hyphens as category separators
      const text = `John Doe\njohn@example.com\n\nSkills
JavaScript, TypeScript, React, Node.js
CI/CD, Docker, Self-motivated, Problem-solving`
      const result = parseResumeText(text)

      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      // These should appear as individual skills, not be split weirdly
      expect(allSkills).toEqual(expect.arrayContaining(['CI/CD', 'Docker']))
      // Should NOT have a category named "Self" or "Problem"
      const categoryNames = result.skills!.map((c) => c.category.toLowerCase())
      expect(categoryNames).not.toContain('self')
      expect(categoryNames).not.toContain('problem')
    })

    it('should handle skills as bullet point list', () => {
      const text = `John Doe\njohn@example.com\n\nSkills
- JavaScript
- Python
- Docker
- AWS`
      const result = parseResumeText(text)
      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      expect(allSkills).toEqual(
        expect.arrayContaining(['JavaScript', 'Python', 'Docker', 'AWS'])
      )
    })

    it('should handle mixed format: some categorized, some not', () => {
      const text = `John Doe\njohn@example.com\n\nSkills
Languages: Python, Java, Go
Docker, Kubernetes, AWS`
      const result = parseResumeText(text)

      // Should have a "Languages" category AND a "General" category
      const names = result.skills!.map((c) => c.category)
      expect(names).toContain('Languages')

      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      expect(allSkills).toEqual(
        expect.arrayContaining(['Python', 'Docker', 'Kubernetes'])
      )
    })

    it('should preserve accumulated General skills when a category appears', () => {
      // Bug: when a "Category:" line appeared, accumulated general skills were lost
      const text = `John Doe\njohn@example.com\n\nSkills
Docker, Kubernetes
Languages: Python, Java`
      const result = parseResumeText(text)

      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      expect(allSkills).toEqual(
        expect.arrayContaining(['Docker', 'Kubernetes', 'Python', 'Java'])
      )
    })

    it('should handle pipe-separated skills', () => {
      const text = `John Doe\njohn@example.com\n\nSkills\nJavaScript | Python | Go | Rust`
      const result = parseResumeText(text)
      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      expect(allSkills.length).toBe(4)
      expect(allSkills).toContain('JavaScript')
      expect(allSkills).toContain('Rust')
    })

    it('should handle semicolon-separated skills', () => {
      const text = `John Doe\njohn@example.com\n\nSkills\nJavaScript; Python; Go`
      const result = parseResumeText(text)
      const allSkills = result.skills!.flatMap((c) =>
        c.items
      )
      expect(allSkills.length).toBe(3)
    })
  })

  // ---------------------------------------------------------------------------
  // Certifications
  // ---------------------------------------------------------------------------

  describe('certifications', () => {
    it('should parse certifications with name and issuer', () => {
      const text = `John Doe\njohn@example.com\n\nCertifications\nAWS Solutions Architect | Amazon\nJan 2023`
      const result = parseResumeText(text)
      expect(result.certifications).toBeDefined()
      expect(result.certifications!.length).toBe(1)
      expect(result.certifications![0].name).toMatch(/AWS Solutions Architect/)
    })

    it('should extract certification date', () => {
      const text = `John Doe\njohn@example.com\n\nCertifications\nAWS Solutions Architect\nAmazon\nJan 2023`
      const result = parseResumeText(text)
      expect(result.certifications![0].date).toMatch(/Jan 2023/)
    })

    it('should parse multiple certifications', () => {
      const text = `John Doe\njohn@example.com\n\nCertifications
AWS Solutions Architect | Amazon
Jan 2023

Google Cloud Professional | Google
Mar 2022`
      const result = parseResumeText(text)
      expect(result.certifications!.length).toBe(2)
    })

    it('should extract credential ID', () => {
      const text = `John Doe\njohn@example.com\n\nCertifications\nAWS SA\nAmazon\nCredential ID: ABC-123\nJan 2023`
      const result = parseResumeText(text)
      expect(result.certifications![0].credentialId).toBe('ABC-123')
    })
  })

  // ---------------------------------------------------------------------------
  // Full realistic resumes — integration tests
  // ---------------------------------------------------------------------------

  describe('full resume parsing', () => {
    it('should parse the standard full resume correctly', () => {
      const result = parseResumeText(FULL_RESUME_TEXT)

      // Contact
      expect(result.contact?.firstName).toBe('John')
      expect(result.contact?.lastName).toBe('Doe')
      expect(result.contact?.email).toBe('john@example.com')
      expect(result.contact?.phone).toBe('555-123-4567')
      expect(result.contact?.linkedin).toMatch(/linkedin\.com\/in\/johndoe/)

      // Summary
      expect(result.summary?.text).toBeTruthy()

      // Experience
      expect(result.experience!.length).toBe(2)

      // Education
      expect(result.education!.length).toBe(1)
      expect(result.education![0].gpa).toBe('3.8')

      // Skills
      expect(result.skills!.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse a dense resume with no blank lines between entries', () => {
      const text = `Jane Smith
jane@email.com
(555) 987-6543

Summary
Passionate full-stack developer with experience across the entire software lifecycle.

Experience
Lead Engineer at BigTech Inc
March 2021 - Present
- Architected microservices platform serving 2M users
- Reduced infrastructure costs by 30%
Backend Developer at MidCo
Jan 2019 - Feb 2021
- Built payment processing system
- Implemented real-time notification service
Junior Developer at StartupZ
Jun 2017 - Dec 2018
- Developed customer-facing dashboard
- Wrote comprehensive test suites

Education
University of Washington
Bachelor of Science in Computer Science
2013 - 2017
GPA: 3.7

Skills
Languages: Python, Java, TypeScript, Go
Frameworks: React, Spring Boot, Express
Cloud: AWS, GCP, Docker, Kubernetes`

      const result = parseResumeText(text)

      // Contact
      expect(result.contact?.firstName).toBe('Jane')
      expect(result.contact?.lastName).toBe('Smith')
      expect(result.contact?.email).toBe('jane@email.com')

      // Summary
      expect(result.summary?.text).toMatch(/passionate full-stack/i)

      // Experience — should be 3 entries, not 2
      expect(result.experience!.length).toBe(3)
      expect(result.experience![0].highlights.length).toBe(2)
      expect(result.experience![1].highlights.length).toBe(2)
      expect(result.experience![2].highlights.length).toBe(2)

      // Education — should be 1, not split into 2
      expect(result.education!.length).toBe(1)
      expect(result.education![0].degree).toMatch(/Bachelor/i)
      expect(result.education![0].gpa).toBe('3.7')

      // Skills — should have 3 categories
      expect(result.skills!.length).toBe(3)
    })

    it('should handle resume with many bullet points per job without splitting', () => {
      const text = `Alex Johnson
alex@test.com

Experience
Product Manager at TechCo
Jan 2021 - Present
- Defined product roadmap for B2B SaaS platform
- Increased MRR by 45% through strategic feature launches
- Collaborated with engineering, design, and marketing teams
- Conducted 50+ customer interviews for user research
- Led migration from legacy monolith to microservices
- Managed team of 3 product analysts

Education
Harvard Business School
MBA
2019 - 2021

Skills
Product Management, Data Analysis, SQL, Agile, Scrum, Jira`

      const result = parseResumeText(text)

      // All 6 bullets should stay with the single job
      expect(result.experience!.length).toBe(1)
      expect(result.experience![0].highlights.length).toBe(6)
    })

    it('should not merge experience bullets into summary', () => {
      // Regression test: experience with many bullets shouldn't leak into summary
      const text = `Sarah Connor
sarah@email.com
555-111-2222
https://www.linkedin.com/in/sconnor

Experience
Security Analyst at CyberCorp
Jan 2022 - Present
- Monitored security events across 500+ endpoints
- Developed automated threat detection scripts
- Reduced mean time to detect incidents by 60%

Education
BS in Cybersecurity
State University
2018 - 2022`

      const result = parseResumeText(text)

      // Summary should be undefined or not contain experience content
      if (result.summary) {
        expect(result.summary.text).not.toMatch(/Monitored/)
        expect(result.summary.text).not.toMatch(/automated threat/)
      }

      expect(result.experience!.length).toBe(1)
      expect(result.experience![0].highlights.length).toBe(3)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases — general
  // ---------------------------------------------------------------------------

  describe('edge cases - general', () => {
    it('should return empty partial for empty text', () => {
      const result = parseResumeText('')
      expect(result.contact?.firstName).toBe('')
      expect(result.contact?.email).toBe('')
      expect(result.experience).toBeUndefined()
      expect(result.education).toBeUndefined()
      expect(result.skills).toBeUndefined()
    })

    it('should handle text with only contact info', () => {
      const result = parseResumeText('John Doe\njohn@example.com\n555-123-4567')
      expect(result.contact?.firstName).toBe('John')
      expect(result.contact?.email).toBe('john@example.com')
      expect(result.experience).toBeUndefined()
    })

    it('should handle interests/hobbies section', () => {
      const text = `John Doe\njohn@example.com\n\nInterests\nHiking, Photography, Open Source Contributing`
      const result = parseResumeText(text)
      expect(result.hobbies).toBeDefined()
      expect(result.hobbies!.items.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Regex consistency — no lastIndex leaks across calls
  // ---------------------------------------------------------------------------

  describe('regex consistency across multiple calls', () => {
    it('should produce identical results when called multiple times in succession', () => {
      const text = `John Doe\njohn@example.com\n\nExperience\nSenior Developer at Tech Corp\nJan 2020 - Present\n- Led team of 8\n- Built dashboards\n\nEducation\nMIT\nBachelor of Science in CS\n2013 - 2017\n\nSkills\nLanguages: JavaScript, Python`

      const result1 = parseResumeText(text)
      const result2 = parseResumeText(text)
      const result3 = parseResumeText(text)

      // All three calls should produce the same structure
      expect(result1.experience!.length).toBe(result2.experience!.length)
      expect(result2.experience!.length).toBe(result3.experience!.length)
      expect(result1.education!.length).toBe(result2.education!.length)
      expect(result2.education!.length).toBe(result3.education!.length)
      expect(result1.skills!.length).toBe(result2.skills!.length)

      // Verify dates are consistently extracted
      expect(result1.experience![0].startDate).toBe(result2.experience![0].startDate)
      expect(result2.experience![0].startDate).toBe(result3.experience![0].startDate)
      expect(result1.education![0].startDate).toBe(result2.education![0].startDate)
    })

    it('should extract dates correctly after parsing a resume with many date ranges', () => {
      const manyDatesText = `John Doe\njohn@example.com\n\nExperience
Engineer at A\nJan 2023 - Present\n- Work
Dev at B\nMar 2021 - Dec 2022\n- Work
Dev at C\nJun 2019 - Feb 2021\n- Work
Intern at D\nJan 2018 - May 2019\n- Work`

      // Parse a resume with many dates first
      const result1 = parseResumeText(manyDatesText)
      expect(result1.experience!.length).toBe(4)

      // Now parse a different resume — should not be affected by prior parse
      const simpleText = `Jane Smith\njane@test.com\n\nExperience\nDev at X\nFeb 2022 - Present\n- Built things`
      const result2 = parseResumeText(simpleText)

      expect(result2.experience!.length).toBe(1)
      expect(result2.experience![0].startDate).toMatch(/Feb/)
      expect(result2.experience![0].company).toMatch(/X/)
    })

    it('should handle alternating calls with different resume formats', () => {
      const textA = `Alice\nalice@test.com\n\nExperience\nManager at Corp\nJan 2020 - Present\n- Managed team`
      const textB = `Bob\nbob@test.com\n\nEducation\nStanford\nMaster of Science in AI\n2019 - 2021`

      // Alternate parsing
      const a1 = parseResumeText(textA)
      const b1 = parseResumeText(textB)
      const a2 = parseResumeText(textA)
      const b2 = parseResumeText(textB)

      expect(a1.experience!.length).toBe(a2.experience!.length)
      expect(a1.experience![0].startDate).toBe(a2.experience![0].startDate)
      expect(b1.education!.length).toBe(b2.education!.length)
      expect(b1.education![0].startDate).toBe(b2.education![0].startDate)
    })
  })

  // ---------------------------------------------------------------------------
  // Experience — date-anchored splitting (parser bug fix)
  // ---------------------------------------------------------------------------

  describe('experience - date-anchored splitting', () => {
    it('should split entries when title and date share a line (no bullets)', () => {
      const text = `John Doe\njohn@example.com\n\nExperience
Front Desk Receptionist
Medrehab, Brampton
Jun 2025 – Present
Welcomed patients and served as the first point of contact
Managed scheduling, check-ins, and patient inquiries
Front Desk Receptionist/Physiotherapist Assistant Aug 2024 – Feb 2025
A Balanced Body Health Services | Kitchener, ON
Supported physiotherapists in implementing exercise programs
Handled patient intake, phone calls, and scheduling`
      const result = parseResumeText(text)
      expect(result.experience!.length).toBe(2)
      expect(result.experience![0].position).toMatch(/Front Desk Receptionist/)
      expect(result.experience![0].company).toMatch(/Medrehab/)
      expect(result.experience![0].highlights.length).toBe(2)
      expect(result.experience![1].position).toMatch(/Physiotherapist Assistant/)
      expect(result.experience![1].company).toMatch(/Balanced Body/)
      expect(result.experience![1].location).toMatch(/Kitchener/)
      expect(result.experience![1].highlights.length).toBe(2)
    })
  })
})
