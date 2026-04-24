-- Enable Row-Level Security on all tables and add a permissive
-- service_role policy so the app (which uses the service role key
-- via Prisma server-side) retains full access without any changes
-- to application code.

ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "Project"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ProjectTeamMember" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ProjectTeamMember"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ProjectImage" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ProjectImage"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ProjectCategoryOrder" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ProjectCategoryOrder"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "NewsPost" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "NewsPost"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "NewsPostImage" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "NewsPostImage"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "TeamMember"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "AdminUser"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "SiteSettings"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "AboutBlock" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "AboutBlock"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "TeamPageContent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "TeamPageContent"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ClientsPageContent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ClientsPageContent"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "CareersPageContent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "CareersPageContent"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "ContactPageContent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "ContactPageContent"
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE "HeroSlide" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON "HeroSlide"
  FOR ALL TO service_role USING (true) WITH CHECK (true);
