import { describe, expect, test } from "vitest";
import { buildFaqPageSchema, parseBrandFaq } from "./faq";

describe("parseBrandFaq", () => {
  test("parses Airtable Q and A blocks while preserving visible text", () => {
    const raw = [
      "Q: Does Giant's delivery include fresh food?",
      "A: Yes, \"fresh food\" and pantry items are available online.",
      "",
      "Q: Can I use vouchers & discounts?",
      "A: Check the store terms.",
      "Line breaks stay in the answer."
    ].join("\n");

    expect(parseBrandFaq(raw)).toEqual([
      {
        question: "Does Giant's delivery include fresh food?",
        answer: "Yes, \"fresh food\" and pantry items are available online.",
        visibleText: "Q: Does Giant's delivery include fresh food?\nA: Yes, \"fresh food\" and pantry items are available online."
      },
      {
        question: "Can I use vouchers & discounts?",
        answer: "Check the store terms.\nLine breaks stay in the answer.",
        visibleText: "Q: Can I use vouchers & discounts?\nA: Check the store terms.\nLine breaks stay in the answer."
      }
    ]);
  });

  test("returns no FAQ items for empty or incomplete Airtable text", () => {
    expect(parseBrandFaq("")).toEqual([]);
    expect(parseBrandFaq("Q: Is this visible without an answer?")).toEqual([]);
    expect(parseBrandFaq("A: This answer has no question.")).toEqual([]);
  });

  test("parses consecutive Q and A pairs without blank lines", () => {
    expect(parseBrandFaq("Q: First question?\nA: First answer.\nQ: Second question?\nA: Second answer.")).toEqual([
      {
        question: "First question?",
        answer: "First answer.",
        visibleText: "Q: First question?\nA: First answer."
      },
      {
        question: "Second question?",
        answer: "Second answer.",
        visibleText: "Q: Second question?\nA: Second answer."
      }
    ]);
  });

  test("parses Airtable heading plus plain question and answer lines", () => {
    const raw = [
      "Frequently Asked Questions",
      "",
      "What is Giant Supermarket?",
      "Giant is a major supermarket chain in Singapore.",
      "",
      "When did Giant enter Singapore?",
      "Giant opened its first Singapore store in 2000.",
      "It operates hypermarkets and supermarkets."
    ].join("\n");

    expect(parseBrandFaq(raw)).toEqual([
      {
        question: "What is Giant Supermarket?",
        answer: "Giant is a major supermarket chain in Singapore.",
        visibleText: "What is Giant Supermarket?\nGiant is a major supermarket chain in Singapore."
      },
      {
        question: "When did Giant enter Singapore?",
        answer: "Giant opened its first Singapore store in 2000.\nIt operates hypermarkets and supermarkets.",
        visibleText:
          "When did Giant enter Singapore?\nGiant opened its first Singapore store in 2000.\nIt operates hypermarkets and supermarkets."
      }
    ]);
  });

  test("parses plain FAQ pairs when the next question follows an answer immediately", () => {
    const raw = [
      "What store formats does Giant offer?",
      "Giant operates hypermarkets, supermarkets, and express stores.",
      "What can shoppers buy at Giant?",
      "Shoppers can buy groceries, fresh produce, household goods, and essentials."
    ].join("\n");

    expect(parseBrandFaq(raw)).toEqual([
      {
        question: "What store formats does Giant offer?",
        answer: "Giant operates hypermarkets, supermarkets, and express stores.",
        visibleText:
          "What store formats does Giant offer?\nGiant operates hypermarkets, supermarkets, and express stores."
      },
      {
        question: "What can shoppers buy at Giant?",
        answer: "Shoppers can buy groceries, fresh produce, household goods, and essentials.",
        visibleText:
          "What can shoppers buy at Giant?\nShoppers can buy groceries, fresh produce, household goods, and essentials."
      }
    ]);
  });
});

describe("buildFaqPageSchema", () => {
  test("builds FAQPage JSON-LD from the same parsed FAQ items shown on the page", () => {
    const items = parseBrandFaq("Q: Can I use vouchers & discounts?\nA: Yes, \"usually\". Check Giant's terms.");
    const schema = buildFaqPageSchema(items);

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can I use vouchers & discounts?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, \"usually\". Check Giant's terms."
          }
        }
      ]
    });
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema);
  });
});
