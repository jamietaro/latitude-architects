// Mapping between human-readable sector names (stored on Project.sectors)
// and category slugs (used in ProjectCategoryOrder.category)

export const SECTOR_TO_SLUG: Record<string, string> = {
  "Residential": "residential",
  "Offices": "offices",
  "Mixed Use": "mixed-use",
  "Culture and Education": "culture-education",
  "Interiors": "interiors",
  "Historic Buildings": "historic-buildings",
  "Urban Design": "urban-design",
  "Competitions": "competitions",
};

export const FEATURED_CATEGORY = "featured";

export function sectorsToSlugs(sectors: string): string[] {
  return sectors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => SECTOR_TO_SLUG[s])
    .filter((s): s is string => Boolean(s));
}

// Client-side — maps UI filter label (from ProjectsGrid) to category slug
export const FILTER_TO_SLUG: Record<string, string> = {
  "RESIDENTIAL": "residential",
  "OFFICES": "offices",
  "MIXED USE": "mixed-use",
  "CULTURE AND EDUCATION": "culture-education",
  "INTERIORS": "interiors",
  "HISTORIC BUILDINGS": "historic-buildings",
  "URBAN DESIGN": "urban-design",
  "COMPETITIONS": "competitions",
};
