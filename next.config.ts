import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tycvnurnvyvlnqdjjnus.supabase.co",
      },
    ],
  },

  // Disable Next.js's automatic trailing-slash normalization. The old
  // WordPress URLs all end in `/` and we want our custom redirect rules
  // below to match them directly, returning a single 308 to the new URL
  // instead of a 308→308 chain.
  skipTrailingSlashRedirect: true,

  // 301 redirects from the old WordPress URLs. `permanent: true` maps to
  // 308 (Permanent Redirect), which is the method-preserving equivalent
  // of 301 and is treated identically by search engines for SEO.
  async redirects() {
    return [
      // Practice section
      {
        source: "/home/practice/riba-chartered-architects/",
        destination: "/practice",
        permanent: true,
      },
      {
        source: "/home/practice/clients/",
        destination: "/practice/clients",
        permanent: true,
      },
      {
        source: "/contact/",
        destination: "/contact",
        permanent: true,
      },
      // Internal move: /practice/contact → /contact
      {
        source: "/practice/contact",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/practice/contact/",
        destination: "/contact",
        permanent: true,
      },

      // Staff → team
      {
        source: "/staff/andrew-gilbert/",
        destination: "/people/team/andrew-gilbert",
        permanent: true,
      },
      {
        source: "/staff/michael-griffiths/",
        destination: "/people/team/michael-griffiths",
        permanent: true,
      },
      {
        source: "/staff/luke-walton/",
        destination: "/people/team/luke-walton",
        permanent: true,
      },
      {
        source: "/staff/anurag-verma/",
        destination: "/people/team/anurag-verma",
        permanent: true,
      },

      // Sector listing pages → filtered projects page
      {
        source: "/projects/residential/",
        destination: "/projects?sector=residential",
        permanent: true,
      },
      {
        source: "/projects/offices/",
        destination: "/projects?sector=offices",
        permanent: true,
      },
      {
        source: "/projects/mixed-use/",
        destination: "/projects?sector=mixed-use",
        permanent: true,
      },
      {
        source: "/projects/culture-and-education/",
        destination: "/projects?sector=culture-education",
        permanent: true,
      },
      {
        source: "/projects/interiors/",
        destination: "/projects?sector=interiors",
        permanent: true,
      },
      {
        source: "/projects/historic-buildings/",
        destination: "/projects?sector=historic-buildings",
        permanent: true,
      },
      {
        source: "/projects/urban-design/",
        destination: "/projects?sector=urban-design",
        permanent: true,
      },
      {
        source: "/projects/competitions/",
        destination: "/projects?sector=competitions",
        permanent: true,
      },

      // Catch-all: strip trailing slash on any /projects/:slug/ URL.
      // Handles the 8 flagship projects as well as every other project
      // with its WordPress-convention trailing-slash URL.
      {
        source: "/projects/:slug/",
        destination: "/projects/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
