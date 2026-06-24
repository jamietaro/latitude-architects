"use client";

import EntryManager from "@/components/admin/EntryManager";

// Journal section — manages the NewsPost model only (via /api/admin/journal).
const CATEGORIES = [
  "Planning Consent",
  "Award",
  "Completion",
  "Press",
  "Journal",
  "Other",
];

export default function JournalAdminPage() {
  return <EntryManager apiPath="/api/admin/journal" categories={CATEGORIES} />;
}
