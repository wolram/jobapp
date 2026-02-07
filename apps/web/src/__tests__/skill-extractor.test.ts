import { extractSkills } from "../lib/skill-extractor";

describe("Skill Extractor", () => {
  test("extracts common programming languages", () => {
    const text =
      "We need someone proficient in JavaScript, TypeScript, and Python";
    const skills = extractSkills(text);

    const names = skills.map((s) => s.skillName);
    expect(names).toContain("javascript");
    expect(names).toContain("typescript");
    expect(names).toContain("python");
  });

  test("extracts framework skills", () => {
    const text =
      "Experience with React, Next.js, and Node.js is required";
    const skills = extractSkills(text);

    const names = skills.map((s) => s.skillName);
    expect(names).toContain("react");
    expect(names).toContain("next.js");
    expect(names).toContain("node.js");
  });

  test("extracts cloud/devops skills", () => {
    const text =
      "Must have experience with AWS, Docker, and Kubernetes in production environments";
    const skills = extractSkills(text);

    const names = skills.map((s) => s.skillName);
    expect(names).toContain("aws");
    expect(names).toContain("docker");
    expect(names).toContain("kubernetes");
  });

  test("returns confidence between 0 and 1", () => {
    const skills = extractSkills("React TypeScript Node.js");
    for (const skill of skills) {
      expect(skill.confidence).toBeGreaterThan(0);
      expect(skill.confidence).toBeLessThanOrEqual(1);
    }
  });

  test("higher mention count increases confidence", () => {
    const text =
      "React React React React is our core framework. We love React.";
    const skills = extractSkills(text);
    const react = skills.find((s) => s.skillName === "react");
    expect(react).toBeDefined();
    expect(react!.confidence).toBeGreaterThanOrEqual(0.8);
  });

  test("returns empty for empty input", () => {
    expect(extractSkills("")).toEqual([]);
  });

  test("returns empty for unrelated text", () => {
    const text = "Looking for a motivated team player with great communication";
    const skills = extractSkills(text);
    // Should find very few or no technical skills
    expect(skills.length).toBeLessThanOrEqual(1);
  });

  test("handles case-insensitive matching", () => {
    const text = "REACT, typescript, Node.JS";
    const skills = extractSkills(text);
    const names = skills.map((s) => s.skillName);
    expect(names).toContain("react");
    expect(names).toContain("typescript");
  });

  test("extracts database skills", () => {
    const text = "PostgreSQL and Redis experience required, MongoDB is a plus";
    const skills = extractSkills(text);
    const names = skills.map((s) => s.skillName);
    expect(names).toContain("postgresql");
    expect(names).toContain("redis");
    expect(names).toContain("mongodb");
  });
});
