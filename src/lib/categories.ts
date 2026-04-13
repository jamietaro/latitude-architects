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

// Tab sequence for the admin Order page. `Featured` first, then sectors.
// Each entry has a slug (ProjectCategoryOrder.category) and a human label.
// `sector` is the value stored inside Project.sectors — null for "featured".
export interface CategoryTab {
  slug: string;
  label: string;
  sector: string | null;
}

export const CATEGORY_TABS: CategoryTab[] = [
  { slug: FEATURED_CATEGORY, label: "Featured", sector: null },
  { slug: "residential", label: "Residential", sector: "Residential" },
  { slug: "offices", label: "Offices", sector: "Offices" },
  { slug: "mixed-use", label: "Mixed Use", sector: "Mixed Use" },
  { slug: "culture-education", label: "Culture and Education", sector: "Culture and Education" },
  { slug: "interiors", label: "Interiors", sector: "Interiors" },
  { slug: "historic-buildings", label: "Historic Buildings", sector: "Historic Buildings" },
  { slug: "urban-design", label: "Urban Design", sector: "Urban Design" },
  { slug: "competitions", label: "Competitions", sector: "Competitions" },
];

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
