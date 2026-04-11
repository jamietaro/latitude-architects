import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";

export default function CookiePolicyPage() {
  return (
    <main>
      <Nav />
      <div style={{ paddingTop: 60 }}>
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "48px 40px 80px",
            fontSize: 15,
            fontWeight: 300,
            lineHeight: 1.75,
            color: "#333333",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              color: "#111111",
              margin: "0 0 32px",
            }}
          >
            Cookie Policy
          </h1>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Purpose and Scope
          </h2>
          <p>
            This policy explains how www.latitudearchitects.com (operated by
            Latitude Architects and Designers Ltd) uses cookies. Cookies are
            small text files which are stored on your computer&apos;s hard
            drive.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Analytical Cookies
          </h2>
          <p>
            These track user numbers, pages visited, and visit duration to
            understand audience reach and marketing effectiveness. We are not
            able to identify you as an individual using analytics cookies.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Functionality Cookies
          </h2>
          <p>
            These enable efficient browsing through features like form
            information retention and login credentials to keep users logged
            into secure areas.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Third-Party Cookies
          </h2>
          <p>
            External applications and widgets on the site may deploy their own
            cookies for various tracking purposes.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            User Control
          </h2>
          <p>
            You can disable cookies in your browser settings, though this may
            limit website functionality in some areas.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Data Protection
          </h2>
          <p>
            If you need clarification, please contact the data protection
            officer at{" "}
            <a
              href="mailto:design@latitudearchitects.com"
              style={{ color: "#111111" }}
            >
              design@latitudearchitects.com
            </a>
            . Please also refer to our{" "}
            <a href="/privacy-policy" style={{ color: "#111111" }}>
              Privacy Policy
            </a>{" "}
            for comprehensive information on data collection and usage
            practices.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
