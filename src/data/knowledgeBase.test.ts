import { describe, it, expect } from "vitest";
import { searchKnowledgeBase } from "./knowledgeBase";

describe("RAG Search Engine Tests", () => {
  it("should match prohibited bag queries with high confidence", () => {
    const query = "Can I bring a backpack or large bag inside the stadium?";
    const result = searchKnowledgeBase(query);
    
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].category).toBe("Prohibited Items");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("should match accessibility services correctly", () => {
    const query = "Is there wheelchair assistance or elevators?";
    const result = searchKnowledgeBase(query);

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].title).toContain("Accessibility");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("should match schedule requests and inject matches context", () => {
    const query = "What is the match schedule at Estadio Azteca?";
    const result = searchKnowledgeBase(query);

    expect(result.context).toContain("Mexico vs. USA");
    expect(result.context).toContain("Estadio Azteca");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("should match stadium capacity and inject stadium details", () => {
    const query = "What is the capacity of SoFi Stadium?";
    const result = searchKnowledgeBase(query);

    expect(result.context).toContain("STADIUM DETAILS");
    expect(result.context).toContain("70,240");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("should match sustainability queries", () => {
    const query = "What are recycling or waste commitments?";
    const result = searchKnowledgeBase(query);

    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches[0].category).toBe("Sustainability");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("should return low confidence for unrelated queries", () => {
    const query = "random string of characters with no match-day keywords";
    const result = searchKnowledgeBase(query);

    expect(result.matches.length).toBe(0);
    expect(result.confidence).toBeLessThan(0.5);
  });
});
