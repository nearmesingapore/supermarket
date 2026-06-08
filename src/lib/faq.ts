export type BrandFaqItem = {
  question: string;
  answer: string;
  visibleText: string;
};

export function parseBrandFaq(value: string | undefined): BrandFaqItem[] {
  const text = (value || "").trim();
  if (!text) return [];

  if (hasMarkedFaq(text)) {
    const blocks = splitMarkedFaqBlocks(text);

    return blocks
      .map(parseMarkedFaqBlock)
      .filter((item): item is BrandFaqItem => Boolean(item));
  }

  return parsePlainFaq(text);
}

export function buildFaqPageSchema(items: BrandFaqItem[]) {
  if (items.length === 0) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

function parseMarkedFaqBlock(block: string): BrandFaqItem | undefined {
  const questionMatch = block.match(/^\s*(?:Q|Question)\s*:\s*(.+)$/im);
  const answerMatch = block.match(/^\s*(?:A|Answer)\s*:\s*([\s\S]+)$/im);

  if (!questionMatch || !answerMatch) return undefined;

  const answerStart = answerMatch.index ?? -1;
  const question = questionMatch[1]?.trim() || "";
  const answer = answerMatch[1]?.trim() || "";

  if (!question || !answer || answerStart < 0) return undefined;

  return {
    question,
    answer,
    visibleText: block
  };
}

function splitMarkedFaqBlocks(text: string) {
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(?:Q|Question)\s*:/i.test(line) && current.some((entry) => entry.trim())) {
      blocks.push(current.join("\n").trim());
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.some((entry) => entry.trim())) {
    blocks.push(current.join("\n").trim());
  }

  return blocks;
}

function parsePlainFaq(text: string): BrandFaqItem[] {
  const items: BrandFaqItem[] = [];
  let question = "";
  let answerLines: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || isFaqHeading(line)) continue;

    if (isQuestionLine(line)) {
      pushPlainFaqItem(items, question, answerLines);
      question = line;
      answerLines = [];
      continue;
    }

    if (question) {
      answerLines.push(rawLine.trimEnd());
    }
  }

  pushPlainFaqItem(items, question, answerLines);

  return items;
}

function hasMarkedFaq(text: string) {
  return /^\s*(?:Q|Question)\s*:/im.test(text) || /^\s*(?:A|Answer)\s*:/im.test(text);
}

function isFaqHeading(line: string) {
  return /^frequently asked questions$/i.test(line);
}

function isQuestionLine(line: string) {
  return /\?\s*$/.test(line);
}

function pushPlainFaqItem(items: BrandFaqItem[], question: string, answerLines: string[]) {
  const answer = answerLines.join("\n").trim();

  if (!question || !answer) return;

  items.push({
    question,
    answer,
    visibleText: `${question}\n${answer}`
  });
}
