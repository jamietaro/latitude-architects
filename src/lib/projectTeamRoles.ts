export const PROJECT_TEAM_ROLES = [
  "Client",
  "Planning Consultant",
  "Structural Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Quantity Surveyor",
  "Project Manager",
  "Contractor",
  "Landscape Architect",
  "Interior Designer",
] as const;

export type ProjectTeamRole = (typeof PROJECT_TEAM_ROLES)[number];
