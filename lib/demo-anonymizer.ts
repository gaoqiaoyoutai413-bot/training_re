import { DEMO_MODE } from "@/lib/demo-mode";
import type { AccountStatus, UserRole } from "@/types/domain";

type PersonSeed = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: UserRole;
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,4}[-.\s]?){2,4}\d{2,4}\b/g;

function hashValue(input: string) {
  let value = 0;

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) % 10000;
  }

  return value;
}

function buildDemoLabel(role: UserRole | undefined, sequence: number) {
  const suffix = String((sequence % 999) + 1).padStart(3, "0");

  if (role === "admin") {
    return `Demo Admin ${suffix}`;
  }

  if (role === "mentor") {
    return `Demo Mentor ${suffix}`;
  }

  return `Demo User ${suffix}`;
}

export function anonymizeName(seed: PersonSeed) {
  if (!DEMO_MODE) {
    return seed.name?.trim() || "未設定";
  }

  return buildDemoLabel(seed.role, hashValue(seed.id || seed.email || seed.name || "demo"));
}

export function anonymizeEmail(seed: PersonSeed) {
  if (!DEMO_MODE) {
    return seed.email?.trim().toLowerCase() || "";
  }

  const prefix =
    seed.role === "admin"
      ? "admin"
      : seed.role === "mentor"
        ? "mentor"
        : "user";
  const suffix = String((hashValue(seed.id || seed.email || seed.name || prefix) % 999) + 1).padStart(3, "0");

  return `${prefix}.${suffix}@example.test`;
}

export function anonymizeAccountStatus(status: AccountStatus | undefined) {
  return status ?? "active";
}

export function sanitizeUrlForDemo(url: string | null | undefined) {
  if (!DEMO_MODE) {
    return url ?? "";
  }

  return url ? "https://example.test/demo-repository" : "";
}

export function sanitizeTextForDemo(input: string, people: PersonSeed[] = []) {
  if (!DEMO_MODE) {
    return input;
  }

  let sanitized = input.replace(EMAIL_PATTERN, "[demo-email]").replace(PHONE_PATTERN, "[demo-phone]");
  const replacements = new Map<string, string>();

  people.forEach((person) => {
    const originalName = person.name?.trim();
    const originalEmail = person.email?.trim().toLowerCase();
    const nextName = anonymizeName(person);
    const nextEmail = anonymizeEmail(person);

    if (originalName) {
      replacements.set(originalName, nextName);
    }

    if (originalEmail) {
      replacements.set(originalEmail, nextEmail);
    }
  });

  [...replacements.entries()]
    .sort((left, right) => right[0].length - left[0].length)
    .forEach(([source, target]) => {
      sanitized = sanitized.split(source).join(target);
    });

  return sanitized;
}
