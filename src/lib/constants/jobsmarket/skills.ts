/**
 * Master data for skills and languages
 * Used in CAND-R02 Step 4: Skills & Languages
 */

export const LANGUAGE_LEVELS = [
  { value: 'basic', label: 'พื้นฐาน' },
  { value: 'conversational', label: 'สนทนาได้' },
  { value: 'fluent', label: 'คล่องแคล่ว' },
  { value: 'native', label: 'เจ้าของภาษา' },
] as const;

// Common skills for autocomplete suggestions (can be expanded)
export const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "React",
  "Next.js",
  "Node.js",
  "Vue.js",
  "Angular",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "Git",
  "CI/CD",
  "Agile",
  "Scrum",
  "Project Management",
  "Microsoft Office",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Figma",
  "UI/UX Design",
  "Data Analysis",
  "Machine Learning",
  "Communication",
  "Teamwork",
  "Leadership",
  "Problem Solving",
] as const;

// Common languages for autocomplete
export const COMMON_LANGUAGES = [
  "ไทย",
  "English",
  "中文 (Chinese)",
  "日本語 (Japanese)",
  "한국어 (Korean)",
  "Français (French)",
  "Deutsch (German)",
  "Español (Spanish)",
  "Português (Portuguese)",
] as const;

export type LanguageLevel = typeof LANGUAGE_LEVELS[number]['value'];
