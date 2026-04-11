import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <p>
            Latitude Architects and Designers Ltd operates this privacy policy
            under GDPR compliance, with Sandra Morris designated as the data
            controller. The data protection officer can be contacted at{" "}
            <a
              href="mailto:design@latitudearchitects.com"
              style={{ color: "#111111" }}
            >
              design@latitudearchitects.com
            </a>
            .
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Data Collection
          </h2>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "#111111",
              margin: "24px 0 8px",
            }}
          >
            Information You Provide
          </h3>
          <p>
            The firm collects names, email addresses, and contact details
            through website submissions and correspondence.
          </p>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "#111111",
              margin: "24px 0 8px",
            }}
          >
            Information Automatically Collected
          </h3>
          <p>
            The site gathers IP addresses, browser and operating system details,
            and usage analytics including pages visited, session duration, and
            interaction patterns.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Data Usage
          </h2>
          <p>Personal information is used to:</p>
          <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
            <li>Respond to user inquiries</li>
            <li>Deliver requested services and products</li>
            <li>Communicate about similar offerings</li>
            <li>Notify users of service changes</li>
            <li>Maintain website security</li>
            <li>Personalise user experience</li>
            <li>
              Support third-party hosting and disaster recovery functions
            </li>
            <li>Enable interactive features</li>
            <li>Measure advertising effectiveness</li>
          </ul>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Data Protection &amp; Retention
          </h2>
          <p>
            The firm implements reasonable steps to secure both digital and
            physical data storage, though transmission risks remain the
            user&apos;s responsibility. Data is retained only as long as
            necessary, with legal or accounting requirements potentially
            extending retention periods.
          </p>

          <h2
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#111111",
              margin: "32px 0 16px",
            }}
          >
            Third-Party Sharing
          </h2>
          <p>
            Analytics and search engine providers may access visitor IP
            addresses and computer configuration data to optimise site
            performance.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
