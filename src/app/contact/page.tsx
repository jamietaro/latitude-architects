import type { Metadata } from "next";
import FadeImage from "@/components/public/FadeImage";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Latitude Architects at 15 Weller Street, London SE1 1QU. Tel: +44 20 7234 0235.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });
  const contactImage = settings?.contactImageUrl ?? null;

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div
          className="contact-grid"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            marginTop: 80,
            padding: "0 40px 80px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
          }}
        >
          {/* Left: Details */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "#111111",
                margin: "0 0 12px",
              }}
            >
              Latitude Architects and Designers Ltd
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "#999999",
                lineHeight: 1.9,
                margin: 0,
              }}
            >
              15 Weller Street
              <br />
              London, SE1 1QU
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "#999999",
                lineHeight: 1.9,
                margin: "8px 0 0",
              }}
            >
              +44 20 7234 0235
            </p>
            <p style={{ margin: "8px 0 0" }}>
              <a
                href="mailto:design@latitudearchitects.com"
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#111111",
                  textDecoration: "none",
                  transition: "opacity 0.25s ease",
                }}
              >
                design@latitudearchitects.com
              </a>
            </p>
            <p style={{ margin: "12px 0 0" }}>
              <a
                href="https://www.instagram.com/latitudearchitects/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  transition: "opacity 0.25s ease",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999999"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="#999999"
                    stroke="none"
                  />
                </svg>
              </a>
            </p>
          </div>

          {/* Right: Image from CMS */}
          <div>
            {contactImage && (
              <FadeImage
                src={contactImage}
                alt="Latitude Architects"
                width={600}
                height={400}
                style={{ width: "100%", height: "auto" }}
              />
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 639px) {
            .contact-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
