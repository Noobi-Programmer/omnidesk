import type {
  SourceDocument,
  ComparisonItem,
  ExtractedFact,
  EvidenceField,
} from "@/lib/contracts";
import { evaluateMoqCompliance, type ParsedConstraints } from "./qualification";

export interface GroundedSupplierCandidate {
  name: string;
  website: string;
  sourceId: string;
  sourceTitle: string;
  location: string;
  productRange: EvidenceField<string>;
  pricing: EvidenceField<string>;
  moq: EvidenceField<string>;
  delivery: EvidenceField<string>;
  credibility: EvidenceField<string>;
  email: EvidenceField<string>;
  specSheetUrl?: string;
  specSheetLabel?: string;
  constraintFit: "meets" | "partial" | "does_not_meet" | "unknown";
  evidenceScore: number;
}

/**
 * Extracts a verbatim snippet of ~80-120 chars around a regex match.
 */
function extractQuote(text: string, matchIndex: number, matchLength: number): string {
  const start = Math.max(0, matchIndex - 30);
  const end = Math.min(text.length, matchIndex + matchLength + 50);
  let snippet = text.substring(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

/**
 * Clean company name from page title or domain.
 */
function cleanCompanyName(title: string, domain: string): string {
  let name = title
    .split(/[-–—|•]/)[0]
    .replace(/(?:Home|Official Site|Corporate Site|Packaging Solutions|Leading Manufacturer)\s*$/i, "")
    .trim();

  if (name.length < 3 || name.toLowerCase().includes("http") || name.length > 40) {
    const domainPart = domain.split(".")[0].replace(/^www\./, "");
    name = domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
  }
  return name;
}

/**
 * Deterministically extracts grounded supplier facts from fetched page markdown.
 */
export function extractGroundedSupplierFromSource(
  source: SourceDocument,
  constraints: ParsedConstraints
): GroundedSupplierCandidate | null {
  const content = source.contentExcerpt || "";
  if (content.length < 20 && source.status !== "ok") {
    return null;
  }

  const name = cleanCompanyName(source.title, source.domain);
  const retrievedAt = source.fetchedAt || new Date().toISOString();

  // 1. Email extraction (strict regex)
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let emailField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const emailMatches = Array.from(content.matchAll(emailRegex));
  const validEmailMatch = emailMatches.find((m) => {
    const e = m[1].toLowerCase();
    return !e.endsWith(".png") && !e.endsWith(".jpg") && !e.includes("example.com") && !e.includes("sentry");
  });

  if (validEmailMatch) {
    emailField = {
      value: validEmailMatch[1],
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: extractQuote(content, validEmailMatch.index || 0, validEmailMatch[1].length),
      retrievedAt,
    };
  }

  // 2. MOQ extraction
  let moqField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const moqRegex = /(?:moq|minimum\s+order(?:\s+quantity)?|batch\s+size|run\s+size)[^.\n]*?([0-9,]+(?:\s*(?:k|thousand|units?|pcs|cartons|cans|boxes|pieces))?)/i;
  const moqMatch = content.match(moqRegex);

  if (moqMatch) {
    const quote = extractQuote(content, moqMatch.index || 0, moqMatch[0].length);
    const moqVal = moqMatch[1].trim();
    const compliance = evaluateMoqCompliance(moqVal, constraints.maxMoq);

    moqField = {
      value: moqVal.includes("unit") || moqVal.includes("can") || moqVal.includes("box") ? moqVal : `${moqVal} units`,
      status: compliance.fit === "does_not_meet" ? "does_not_meet" : "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: quote,
      retrievedAt,
      constraintFit: compliance.fit,
    };
  }

  // 3. Pricing extraction
  let pricingField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const priceRegex = /(?:€|EUR|\$|USD|₹|INR|Rs\.?)\s*([0-9.,]+(?:\s*(?:–|-|to)\s*[0-9.,]+)?(?:\s*(?:\/|\s+per\s+)(?:unit|can|box|carton|piece))?)/i;
  const priceMatch = content.match(priceRegex);

  if (priceMatch) {
    const quote = extractQuote(content, priceMatch.index || 0, priceMatch[0].length);
    pricingField = {
      value: priceMatch[0].trim(),
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: quote,
      retrievedAt,
    };
  }

  // 4. Product range extraction
  let productField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const productPatterns = [
    /(?:250ml\s+slim|330ml\s+sleek|330ml\s+standard|500ml|aluminum\s+cans?|corrugated\s+boxes?|kraft\s+mailers?)/i,
  ];
  let pMatchFound = false;
  for (const pat of productPatterns) {
    const pMatch = content.match(pat);
    if (pMatch) {
      productField = {
        value: pMatch[0],
        status: "verified",
        sourceUrl: source.url,
        sourceTitle: source.title,
        supportingQuote: extractQuote(content, pMatch.index || 0, pMatch[0].length),
        retrievedAt,
      };
      pMatchFound = true;
      break;
    }
  }
  if (!pMatchFound) {
    productField = {
      value: null,
      status: "not_found",
    };
  }

  // 5. Delivery / Lead Time
  let deliveryField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const deliveryRegex = /([0-9]+(?:\s*[-–]\s*[0-9]+)?\s*(?:weeks?|wks?|days?|business\s+days?)(?:\s*\([^)]+\))?)/i;
  const deliveryMatch = content.match(deliveryRegex);
  if (deliveryMatch) {
    deliveryField = {
      value: deliveryMatch[0].trim(),
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: extractQuote(content, deliveryMatch.index || 0, deliveryMatch[0].length),
      retrievedAt,
    };
  }

  // 6. Location / Facility
  let location = "Not specified";
  const locRegex = /(?:plant|facility|headquarters|based\s+in|factory|manufacturing\s+unit)[:\s]+([A-Za-z\s,]+(?:plant|facility|DE|NL|FR|PL|ES|UK|IN)?)/i;
  const locMatch = content.match(locRegex);
  if (locMatch) {
    location = locMatch[1].trim().slice(0, 40);
  }

  // 7. Credibility / Certifications (Extracted ONLY if explicitly cited on page)
  let credibilityField: EvidenceField<string> = {
    value: null,
    status: "not_found",
  };
  const certRegex = /(ISO\s*9001|ISO\s*14001|BPA[-\s]?NI|FSC(?:-certified)?|BRCGS|HACCP|FDA\s+compliance|EC\s+1935\/2004)/i;
  const certMatch = content.match(certRegex);
  if (certMatch) {
    credibilityField = {
      value: certMatch[0],
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: extractQuote(content, certMatch.index || 0, certMatch[0].length),
      retrievedAt,
    };
  }

  // 8. Spec sheet link
  let specSheetUrl: string | undefined;
  let specSheetLabel: string | undefined;
  const pdfMatch = content.match(/(?:href=["'])([^"']+\.pdf)(?:["'])/i) ||
    content.match(/\[([^\]]+)\]\(([^)]+\.pdf)\)/i);

  if (pdfMatch) {
    specSheetUrl = pdfMatch[2] || pdfMatch[1];
    specSheetLabel = (pdfMatch[1] || "spec-sheet.pdf").replace(/.*\/|\.pdf$/gi, "") + ".pdf";
  }

  // Calculate constraint fit honestly
  let constraintFit: "meets" | "partial" | "does_not_meet" | "unknown" = "unknown";
  if (constraints.maxMoq) {
    if (moqField.status === "does_not_meet") {
      constraintFit = "does_not_meet";
    } else if (moqField.status === "verified") {
      constraintFit = "meets";
    } else {
      constraintFit = "unknown";
    }
  } else {
    constraintFit = moqField.status === "verified" ? "meets" : "unknown";
  }

  // Calculate evidence score honestly (0 to 100 based on verified facts)
  const trackedFields = [moqField, pricingField, deliveryField, emailField, productField, credibilityField];
  const verifiedCount = trackedFields.filter((f) => f.status === "verified").length;
  const evidenceScore = Math.round((verifiedCount / trackedFields.length) * 100);

  return {
    name,
    website: source.url,
    sourceId: source.id,
    sourceTitle: source.title,
    location,
    productRange: productField,
    pricing: pricingField,
    moq: moqField,
    delivery: deliveryField,
    credibility: credibilityField,
    email: emailField,
    specSheetUrl,
    specSheetLabel,
    constraintFit,
    evidenceScore,
  };
}

/**
 * Maps GroundedSupplierCandidate into the standard ComparisonItem and ExtractedFact contracts.
 */
export function convertCandidateToComparisonItem(
  candidate: GroundedSupplierCandidate,
  index: number
): {
  item: ComparisonItem;
  facts: ExtractedFact[];
} {
  const itemId = `c-${String(index + 1).padStart(2, "0")}`;
  const facts: ExtractedFact[] = [];

  const evidenceFields: Record<string, EvidenceField<string>> = {
    product_range: candidate.productRange,
    pricing: candidate.pricing,
    moq: candidate.moq,
    delivery: candidate.delivery,
    credibility: candidate.credibility,
    contact: candidate.email,
  };

  const factsRecord: Record<string, string> = {};

  for (const [key, field] of Object.entries(evidenceFields)) {
    const factId = `f-${key}-${itemId}`;
    const isFound = field.value !== null && field.status !== "not_found";

    facts.push({
      id: factId,
      sourceId: candidate.sourceId,
      field: key,
      value: isFound ? field.value : null,
      status: isFound ? "found" : "not_found",
      quote: field.supportingQuote,
      confidence: field.status === "verified" ? "high" : field.status === "unverified" ? "medium" : "low",
      evidenceStatus: field.status,
      sourceUrl: field.sourceUrl,
      sourceTitle: field.sourceTitle,
      retrievedAt: field.retrievedAt,
      constraintViolated: field.status === "does_not_meet",
    });

    factsRecord[key] = isFound ? field.value! : "Not found";
  }

  const statusBadge =
    candidate.constraintFit === "does_not_meet"
      ? "does_not_meet"
      : candidate.evidenceScore >= 70
      ? "verified"
      : candidate.evidenceScore >= 40
      ? "missing_info"
      : "unverified";

  const item: ComparisonItem = {
    id: itemId,
    name: candidate.name,
    website: candidate.website,
    sourceIds: [candidate.sourceId],
    facts: factsRecord,
    evidenceScore: candidate.evidenceScore,
    location: candidate.location,
    constraintFit: candidate.constraintFit,
    statusBadge,
    email: candidate.email.value,
    specSheetUrl: candidate.specSheetUrl,
    specSheetLabel: candidate.specSheetLabel,
    evidenceFields,
  };

  return { item, facts };
}

export interface GroundedGeneralCandidate {
  name: string;
  website: string;
  sourceId: string;
  sourceTitle: string;
  entityType: string;
  location?: string;
  keyFields: Record<string, EvidenceField<string>>;
  evidenceScore: number;
}

export function extractGroundedGeneralEntityFromSource(
  source: SourceDocument,
  intent: string = "general"
): GroundedGeneralCandidate | null {
  const content = source.contentExcerpt || "";
  if (content.length < 20 && source.status !== "ok") {
    return null;
  }

  const name = cleanCompanyName(source.title, source.domain);
  const retrievedAt = source.fetchedAt || new Date().toISOString();

  // 1. Metric / Number extraction (funding, valuation, speed, performance, etc.)
  let metricField: EvidenceField<string> = { value: null, status: "not_found" };
  const numRegex = /(?:\$|€|₹|USD|EUR)\s*([0-9.,]+\s*(?:million|billion|M|B|k|crore)?)|(?:valued\s+at\s+[\$€₹][0-9.,]+\s*(?:million|billion|M|B)?)|(?:raised\s+[\$€₹][0-9.,]+\s*(?:million|billion|M|B)?)/i;
  const numMatch = content.match(numRegex);
  if (numMatch) {
    metricField = {
      value: numMatch[0].trim(),
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: extractQuote(content, numMatch.index || 0, numMatch[0].length),
      retrievedAt,
    };
  }

  // 2. Proposition / Key takeaway
  let summaryField: EvidenceField<string> = { value: null, status: "not_found" };
  const firstSentence = content.split(/[.\n]/).find((s) => s.trim().length > 30 && s.trim().length < 200);
  if (firstSentence) {
    summaryField = {
      value: firstSentence.trim(),
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: firstSentence.trim(),
      retrievedAt,
    };
  }

  // 3. Date / Milestone
  let dateField: EvidenceField<string> = { value: null, status: "not_found" };
  const dateRegex = /\b(202[0-9]|Q[1-4]\s*202[0-9]|January|February|March|April|May|June|July|August|September|October|November|December\s+202[0-9])\b/i;
  const dateMatch = content.match(dateRegex);
  if (dateMatch) {
    dateField = {
      value: dateMatch[0].trim(),
      status: "verified",
      sourceUrl: source.url,
      sourceTitle: source.title,
      supportingQuote: extractQuote(content, dateMatch.index || 0, dateMatch[0].length),
      retrievedAt,
    };
  }

  const keyFields: Record<string, EvidenceField<string>> = {
    key_findings: summaryField,
    quantitative_data: metricField,
    timeline_or_milestone: dateField,
  };

  const verifiedCount = Object.values(keyFields).filter((f) => f.status === "verified").length;
  const evidenceScore = Math.round((verifiedCount / Object.keys(keyFields).length) * 100);

  return {
    name,
    website: source.url,
    sourceId: source.id,
    sourceTitle: source.title,
    entityType:
      intent === "startup"
        ? "Startup"
        : intent === "competitor"
        ? "Competitor"
        : intent === "technology"
        ? "Technology / Model"
        : "Research Entity",
    keyFields,
    evidenceScore,
  };
}

export function convertGeneralCandidateToComparisonItem(
  candidate: GroundedGeneralCandidate,
  index: number
): {
  item: ComparisonItem;
  facts: ExtractedFact[];
} {
  const itemId = `c-${String(index + 1).padStart(2, "0")}`;
  const facts: ExtractedFact[] = [];
  const factsRecord: Record<string, string> = {};

  for (const [key, field] of Object.entries(candidate.keyFields)) {
    const factId = `f-${key}-${itemId}`;
    const isFound = field.value !== null && field.status !== "not_found";

    facts.push({
      id: factId,
      sourceId: candidate.sourceId,
      field: key,
      value: isFound ? field.value : null,
      status: isFound ? "found" : "not_found",
      quote: field.supportingQuote,
      confidence: field.status === "verified" ? "high" : "low",
      evidenceStatus: field.status,
      sourceUrl: field.sourceUrl,
      sourceTitle: field.sourceTitle,
      retrievedAt: field.retrievedAt,
    });

    factsRecord[key] = isFound ? field.value! : "Not found";
  }

  const item: ComparisonItem = {
    id: itemId,
    name: candidate.name,
    website: candidate.website,
    sourceIds: [candidate.sourceId],
    facts: factsRecord,
    evidenceScore: candidate.evidenceScore,
    constraintFit: candidate.evidenceScore > 0 ? "meets" : "unknown",
    statusBadge: candidate.evidenceScore >= 60 ? "verified" : "missing_info",
    evidenceFields: candidate.keyFields,
  };

  return { item, facts };
}
