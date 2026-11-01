import type { SourceDocument } from "@/lib/contracts";
import { isBlockedDomain, isEditorialUrl } from "../services/tinyfish/search";

export function cleanSupplierName(title: string): string {
  let cleaned = title.trim();

  // Strip "Welcome to " prefix
  cleaned = cleaned.replace(/^Welcome\s+to\s+/i, "");

  // Split on dividers: —, –, -, |, •
  cleaned = cleaned.split(/\s*[-–—|•]\s*/)[0].trim();

  // Strip trailing "Home Page", "Official Site", etc.
  cleaned = cleaned.replace(/\s*(?:Home Page|Official Site|Home|Corporate Site)\s*$/i, "").trim();

  return cleaned;
}

export interface SupplierQualification {
  isQualified: boolean;
  flags: string[];
  reason?: string;
  isArticle?: boolean;
  isDirectory?: boolean;
}

export function qualifySupplierCandidate(
  source: SourceDocument,
  category?: string,
  targetLocation?: string
): SupplierQualification {
  const flags: string[] = [];
  const lowerUrl = (source.url || "").toLowerCase();
  const lowerDomain = (source.domain || "").toLowerCase();
  const lowerTitle = (source.title || "").toLowerCase();
  const lowerContent = (source.contentExcerpt || "").toLowerCase();

  // 1. Check blocked aggregator directories & couriers
  if (isBlockedDomain(lowerDomain)) {
    flags.push("BLOCKED_DIRECTORY_OR_COURIER");
    return {
      isQualified: false,
      flags,
      reason: `Domain ${source.domain} is an aggregator directory or courier service, not a direct manufacturer.`,
      isDirectory: true,
    };
  }

  // Also check courier content keywords (porter, truck hire, courier delivery)
  if (
    /hire\s+mini\s+trucks|courier\s+delivery\s+services|parcel\s+delivery/i.test(lowerContent) &&
    !/corrugated|box\s+maker|carton\s+manufacturer|bottle|can\s+manufacturer/i.test(lowerContent)
  ) {
    flags.push("COURIER_LOGISTICS");
    return {
      isQualified: false,
      flags,
      reason: `Source represents an aggregator directory or courier service, not a direct manufacturer.`,
      isDirectory: true,
    };
  }

  // 2. Check editorial articles, listicles, news, publications, and regulatory registries
  if (
    lowerDomain.includes("europa.eu") ||
    lowerDomain.includes("verpackungsregister") ||
    lowerDomain.includes("packaging-journal") ||
    lowerDomain.includes("wikipedia") ||
    lowerDomain.includes("medium.com") ||
    lowerTitle.includes("regulation") ||
    lowerTitle.includes("directive") ||
    lowerTitle.includes("packaging journal") ||
    lowerTitle.includes("packaging-journal") ||
    isEditorialUrl(source.url) ||
    /top\s+\d+|best\s+\d+|guide\s+to|overview\s+of|market\s+report/i.test(lowerTitle) ||
    /top-\d+|best-\d+|list-of-/i.test(lowerUrl)
  ) {
    flags.push("EDITORIAL_ARTICLE");
    return {
      isQualified: false,
      flags,
      reason: "Editorial article or blog listicle, not a direct business entity.",
      isArticle: true,
    };
  }

  // 3. Location check if target location is specified
  if (targetLocation) {
    const locLower = targetLocation.toLowerCase();
    const isLocal =
      lowerContent.includes(locLower) ||
      lowerTitle.includes(locLower) ||
      (locLower.includes("bengaluru") && (lowerContent.includes("bangalore") || lowerContent.includes("peenya") || lowerContent.includes("whitefield")));

    if (!isLocal) {
      // Check if it's explicitly elsewhere (e.g. Delhi, Mumbai, etc.)
      if (/new\s+delhi|okhla|mumbai|chennai|hyderabad|pune|gurgaon/i.test(lowerContent)) {
        flags.push("LOCATION_UNVERIFIED");
      }
    }
  }

  return {
    isQualified: true,
    flags,
  };
}

export function qualifyCandidate(
  title: string,
  url: string,
  domain: string
) {
  const dummyDoc: SourceDocument = {
    id: "check",
    title,
    url,
    domain,
    retrievedVia: "search",
    fetchedVia: "fetch",
    status: "ok",
  };
  const qual = qualifySupplierCandidate(dummyDoc);
  return {
    isArticle: Boolean(qual.isArticle),
    isDirectory: Boolean(qual.isDirectory),
    isQualifiedSupplier: qual.isQualified,
    reason: qual.reason,
  };
}

export interface ParsedConstraints {
  maxMoq?: number;
  isStrictLessThan?: boolean;
  targetFormat?: string;
  certifications: string[];
  geography?: string;
  category?: string;
}

export function parsePromptConstraints(prompt: string): ParsedConstraints {
  const constraints: ParsedConstraints = {
    certifications: [],
  };

  // Check strict less than
  const isStrictMatch =
    /(?:moq|minimum\s+order(?:\s+quantity)?)\s*(?:<|below|under|less\s+than)\s*([0-9,]+)/i.test(prompt) ||
    /(?:under|below|less\s+than)\s*([0-9,]+)\s*(k|m|thousand|million)?\s*(?:units?|moq|batch)/i.test(prompt);

  if (isStrictMatch) {
    constraints.isStrictLessThan = true;
  }

  // MOQ detection: e.g. "MOQ < 50k", "MOQ < 50000", "under 50,000", "max MOQ 50k"
  const moqMatch =
    prompt.match(/(?:moq|minimum\s+order(?:\s+quantity)?)\s*(?:<|<=|below|under|less\s+than|max(?:imum)?:?)\s*([0-9,]+)\s*(k|m|thousand|million)?/i) ||
    prompt.match(/(?:under|below|less\s+than)\s*([0-9,]+)\s*(k|m|thousand|million)?\s*(?:units?|moq|batch)/i);

  if (moqMatch) {
    const rawNum = parseFloat(moqMatch[1].replace(/,/g, ""));
    const unit = (moqMatch[2] || "").toLowerCase();
    let multiplier = 1;
    if (unit === "k" || unit === "thousand") multiplier = 1000;
    if (unit === "m" || unit === "million") multiplier = 1000000;
    constraints.maxMoq = rawNum * multiplier;
  }

  // Format detection
  if (/250ml\s*slim/i.test(prompt)) {
    constraints.targetFormat = "250ml Slim";
  } else if (/250ml/i.test(prompt)) {
    constraints.targetFormat = "250ml";
  } else if (/330ml/i.test(prompt)) {
    constraints.targetFormat = "330ml";
  }

  // Certifications
  if (/bpa[-\s]?ni/i.test(prompt)) {
    constraints.certifications.push("BPA-NI");
  }
  if (/fsc/i.test(prompt)) {
    constraints.certifications.push("FSC");
  }
  if (/iso/i.test(prompt)) {
    constraints.certifications.push("ISO");
  }
  if (/recyclable/i.test(prompt)) {
    constraints.certifications.push("Recyclable");
  }

  // Geography
  if (/\b(?:eu|europe|european|emea)\b/i.test(prompt)) {
    constraints.geography = "EU / Europe";
  } else if (/\b(?:bengaluru|bangalore|india)\b/i.test(prompt)) {
    constraints.geography = "Bengaluru, India";
  } else if (/\b(?:us|usa|united\s+states)\b/i.test(prompt)) {
    constraints.geography = "United States";
  }

  // Category
  if (/aluminum\s+can|cold\s+brew|beverage\s+can/i.test(prompt)) {
    constraints.category = "Aluminum Beverage Cans";
  } else if (/corrugated|box|mailer|packaging/i.test(prompt)) {
    constraints.category = "Corrugated Packaging & Mailers";
  }

  return constraints;
}

export function evaluateMoqCompliance(
  extractedMoq: string | null | undefined,
  maxMoq: number | undefined,
  isStrictLessThan: boolean = true
): {
  fit: "meets" | "does_not_meet" | "unknown";
  numericMoq?: number;
  reason?: string;
} {
  if (!maxMoq) return { fit: "meets" };
  if (!extractedMoq || extractedMoq.toLowerCase().includes("not found")) {
    return { fit: "unknown", reason: "MOQ not publicly specified" };
  }

  const match = extractedMoq.match(/([0-9,]+)\s*(k|thousand|m|million)?/i);
  if (!match) return { fit: "unknown" };

  const rawNum = parseFloat(match[1].replace(/,/g, ""));
  const unit = (match[2] || "").toLowerCase();
  let multiplier = 1;
  if (unit === "k" || unit === "thousand") multiplier = 1000;
  if (unit === "m" || unit === "million") multiplier = 1000000;
  const num = rawNum * multiplier;

  const fails = isStrictLessThan ? num >= maxMoq : num > maxMoq;

  if (fails) {
    return {
      fit: "does_not_meet",
      numericMoq: num,
      reason: `MOQ of ${extractedMoq} (${num.toLocaleString()}) exceeds target maximum of ${maxMoq.toLocaleString()} units`,
    };
  }

  return {
    fit: "meets",
    numericMoq: num,
  };
}
