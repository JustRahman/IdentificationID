/**
 * Legal documents of Identification ID (server-only).
 *
 * Each document version is a Markdown file in src/content/legal/<slug>/<version>.md.
 * Published versions are IMMUTABLE: never edit a file once it is live. To change
 * a document, add a new version file and point `current` to it. Old versions stay
 * reachable at /legal/<slug>/<version> forever, and the SHA-256 of the file is what
 * a manufacturer's acceptance record points to.
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { AGREEMENT_HASH, AGREEMENT_VERSION, PRIVACY_HASH, PRIVACY_VERSION } from "@/lib/constants";

export interface LegalVersion {
  version: string;
  effective: string; // ISO date the version took effect
  until?: string; // ISO date it was replaced (archived versions)
}

export interface LegalDoc {
  slug: string;
  title: string;
  summary: string;
  current: string;
  versions: LegalVersion[]; // newest first
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service and Manufacturer Agreement",
    summary:
      "The main B2B agreement every manufacturer accepts before paying: what the registry is, your responsibilities, verification, billing, limitation of liability and indemnification.",
    current: "1.1",
    versions: [
      { version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" },
      { version: "2026-10-01", effective: "2026-10-01", until: "2026-10-05" },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary: "What personal information we collect, why, who processes it, how long we keep it and your rights.",
    current: "1.1",
    versions: [
      { version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" },
      { version: "0.9", effective: "2026-10-01", until: "2026-10-05" },
    ],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    summary: "Rules for using the registry, Manufacturer IDs, Product IDs, QR codes and the API, and how we enforce them.",
    current: "1.1",
    versions: [{ version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" }],
  },
  {
    slug: "verification-policy",
    title: "Manufacturer Verification Policy",
    summary: "What \"Verified Manufacturer\" means, what it does not mean, and how verification can be reviewed or revoked.",
    current: "1.1",
    versions: [{ version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" }],
  },
  {
    slug: "refund",
    title: "Refund & Cancellation Policy",
    summary: "Automatic renewal, how to cancel, what happens to your IDs after cancellation, and refunds.",
    current: "1.1",
    versions: [
      { version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" },
      { version: "0.9", effective: "2026-10-01", until: "2026-10-05" },
    ],
  },
  {
    slug: "ip-policy",
    title: "Intellectual Property & Trademark Complaint Policy",
    summary: "How to report trademark or copyright infringement and brand impersonation, and how complaints are reviewed.",
    current: "1.1",
    versions: [{ version: "1.1", effective: "2026-11-01" },
      { version: "1.0", effective: "2026-10-05", until: "2026-11-01" }],
  },
];

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "legal");

export function getDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

export function getVersion(doc: LegalDoc, version: string): LegalVersion | undefined {
  return doc.versions.find((v) => v.version === version);
}

export function readDocText(slug: string, version: string): string {
  return readFileSync(path.join(CONTENT_DIR, slug, `${version}.md`), "utf8");
}

/** SHA-256 (hex) of the exact published file - stored with each acceptance. */
export function docHash(slug: string, version: string): string {
  return createHash("sha256").update(readDocText(slug, version), "utf8").digest("hex");
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const LEGAL_CONTACTS = {
  legal: "legal@identificationid.com",
  privacy: "privacy@identificationid.com",
  abuse: "abuse@identificationid.com",
  support: "support@identificationid.com",
};

export const CORPORATE = {
  legalName: "Global Product Identification Inc.",
  type: "Canadian federal corporation (Canada Business Corporations Act)",
  corporationNumber: "1811730-6",
  businessNumber: "797960648",
  registeredOffice: "Canada",
  governingLaw: "British Columbia, Canada",
};

/** Fails the build if the checkout checkbox points at text that isn't the published file. */
export function assertAcceptanceHashes(): void {
  const checks: [string, string, string][] = [
    ["terms", AGREEMENT_VERSION, AGREEMENT_HASH],
    ["privacy", PRIVACY_VERSION, PRIVACY_HASH],
  ];
  for (const [slug, version, expected] of checks) {
    const actual = docHash(slug, version);
    if (actual !== expected) {
      throw new Error(
        `Legal document ${slug}/${version}.md changed (sha256 ${actual}, expected ${expected}). ` +
          "Published versions must never change: add a new version instead."
      );
    }
  }
}
