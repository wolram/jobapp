/**
 * MVP skill extractor: keyword-based extraction from job descriptions.
 * Will be enhanced with NLP/LLM in future phases.
 */

const COMMON_SKILLS = [
  // Programming languages
  "javascript", "typescript", "python", "java", "c#", "c++", "go", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "dart",
  // Frontend
  "react", "angular", "vue", "svelte", "next.js", "nuxt", "html", "css",
  "sass", "tailwind", "bootstrap", "webpack", "vite",
  // Backend
  "node.js", "express", "fastify", "django", "flask", "spring", "rails",
  ".net", "laravel", "nestjs",
  // Mobile
  "react native", "flutter", "ios", "android", "swiftui",
  // Data
  "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
  "dynamodb", "cassandra", "neo4j",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
  "jenkins", "github actions", "ci/cd", "linux",
  // AI/ML
  "machine learning", "deep learning", "nlp", "computer vision",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
  // Design
  "figma", "sketch", "adobe xd", "ui/ux", "design system",
  // Management & Methods
  "agile", "scrum", "kanban", "jira", "product management",
  "project management", "leadership",
  // General
  "api", "rest", "graphql", "grpc", "microservices", "system design",
  "architecture", "testing", "tdd", "git",
];

interface ExtractedSkill {
  skillName: string;
  confidence: number;
}

export function extractSkills(text: string): ExtractedSkill[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const found: ExtractedSkill[] = [];

  for (const skill of COMMON_SKILLS) {
    // Use word boundary check for short skills to avoid false positives
    if (skill.length <= 2) {
      const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
      if (regex.test(lowerText)) {
        found.push({ skillName: skill, confidence: 0.7 });
      }
    } else if (lowerText.includes(skill)) {
      // Longer skills are less likely to be false positives
      const count = (lowerText.match(new RegExp(escapeRegex(skill), "gi")) ?? []).length;
      const confidence = Math.min(0.9, 0.5 + count * 0.1);
      found.push({ skillName: skill, confidence });
    }
  }

  return found;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
