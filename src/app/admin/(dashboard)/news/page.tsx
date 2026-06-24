"use client";

import EntryManager from "@/components/admin/EntryManager";

// News section — manages the NewsItem model only (via /api/admin/news).
const CATEGORIES = [
  "Planning Consent",
  "Award",
  "Completion",
  "Press",
  "Other",
];

export default function NewsAdminPage() {
  return <EntryManager apiPath="/api/admin/news" categories={CATEGORIES} />;
}
