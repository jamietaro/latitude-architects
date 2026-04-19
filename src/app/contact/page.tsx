import type { Metadata } from "next";
import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import MapBoxLoader from "@/components/public/MapBoxLoader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Latitude Architects at 15 Weller Street, London SE1 1QU. Tel: +44 20 7234 0235.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await prisma.contactPageContent.findUnique({ where: { id: 1 } });

  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div
          className="contact-grid"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "48px 40px 80px",
            display: "flex",
            alignItems: "flex-start",
            gap: 64,
          }}
        >
          {/* Left: Details */}
          <div className="contact-text" style={{ flex: "2 1 0", minWidth: 0 }}>
            {content?.heading && (
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#111111",
                  margin: "0 0 12px",
                }}
              >
                {content.heading}
              </p>
            )}

            {content?.address && (
              <div
                className="contact-address"
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#999999",
                  lineHeight: 1.9,
                }}
                dangerouslySetInnerHTML={{ __html: content.address }}
              />
            )}

            {content?.phone && (
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#999999",
                  lineHeight: 1.9,
                  margin: "8px 0 0",
                }}
              >
                {content.phone}
              </p>
            )}

            {content?.email && (
              <p style={{ margin: "8px 0 0" }}>
                <a
                  href={`mailto:${content.email}`}
                  style={{
                    fontSize: 14,
                    fontWeight: 300,
                    color: "#111111",
                    textDecoration: "none",
                    transition: "opacity 0.25s ease",
                  }}
                >
                  {content.email}
                </a>
              </p>
            )}

            {content?.body && (
              <div
                className="contact-body"
                style={{
                  marginTop: 16,
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#999999",
                  lineHeight: 1.9,
                }}
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}

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

          {/* Right: Map */}
          <div className="contact-map" style={{ flex: "3 1 0", minWidth: 0 }}>
            <div style={{ width: "100%", aspectRatio: "1 / 1" }}>
              <MapBoxLoader />
            </div>
            <a
              className="contact-map-link"
              href="https://www.google.com/maps/search/15+Weller+Street,+London+SE1+1QU"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 12,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                fontWeight: 300,
                color: "#999999",
                textDecoration: "none",
              }}
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <style>{`
          .contact-address p {
            margin: 0;
          }
          .contact-body p {
            margin: 0 0 8px;
          }
          .contact-body p:last-child {
            margin-bottom: 0;
          }
          .contact-map-link:hover {
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            .contact-grid {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 32px !important;
            }
            .contact-text,
            .contact-map {
              flex: 0 0 auto !important;
            }
          }
        `}</style>
      </div>
      <Footer />
    </main>
  );
}
