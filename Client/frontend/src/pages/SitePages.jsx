import { Mail } from "lucide-react";

const CONTACT_EMAIL = "yeoleharsh577@gmail.com";

const InfoPage = ({ title, intro, sections, updated = true, children }) => (
  <article className="page-shell max-w-4xl py-12 sm:py-16">
    <header className="border-b border-slate-200 pb-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
        Wanderlust
      </p>
      <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        {intro}
      </p>
      {updated && (
        <p className="mt-4 text-xs text-slate-500">
          Last updated: October 7, 2026
        </p>
      )}
    </header>
    {children}
    <div className="mt-8 space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-display text-2xl text-slate-900">
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-3 text-sm leading-7 text-slate-600"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  </article>
);

export const About = () => (
  <InfoPage
    title="About Wanderlust"
    intro="Wanderlust is a travel planning and inspiration site for people who want to make more thoughtful trips."
    updated={false}
    sections={[
      {
        title: "What you can do here",
        paragraphs: [
          "Explore destination ideas, save places for later, and organize your plans in one place. You can build trip itineraries, invite other people to collaborate, and keep travel notes and photos in your gallery.",
          "Wanderlust is a planning tool, not a travel agency or booking service. Destination information is for inspiration; check current details directly with airlines, accommodation providers, local authorities, and other relevant sources before you travel.",
        ],
      },
      {
        title: "Made for your next journey",
        paragraphs: [
          "We want planning to feel approachable, personal, and useful, whether you are collecting ideas or getting ready to go.",
        ],
      },
    ]}
  />
);

export const Contact = () => (
  <InfoPage
    title="Contact us"
    intro="Questions about Wanderlust, your account, or your personal information? Get in touch by email."
    updated={false}
    sections={[
      {
        title: "How to reach us",
        paragraphs: [
          `Email ${CONTACT_EMAIL} and include enough detail for us to understand your question. Please do not send passwords or other sensitive account credentials by email.`,
        ],
      },
      {
        title: "Account and privacy requests",
        paragraphs: [
          "You can use this address to ask about your account or request help with personal information associated with it. We may need to verify that a request is yours before acting on it.",
        ],
      },
    ]}
  >
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
    >
      <Mail size={17} />
      Email Wanderlust
    </a>
  </InfoPage>
);

export const PrivacyPolicy = () => (
  <InfoPage
    title="Privacy policy"
    intro="This policy explains what information Wanderlust handles when you use the site and the choices available to you."
    sections={[
      {
        title: "Information you provide",
        paragraphs: [
          "When you create an account, we handle information such as your name, email address, and password (which is stored in a protected, hashed form). If you choose to add profile details, a profile photo, trip plans, itineraries, favorites, invitations, or gallery posts, we process that information to provide those features.",
          "If you publish a gallery post as public, its content may be visible to other visitors. Keep private information out of public posts and only upload photos you have permission to share.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "We use account and travel information to operate the site, authenticate you, save and display your plans, support collaboration features, respond to requests, and maintain the security and reliability of the service.",
          "Wanderlust does not sell your account information. Information may be processed by service providers that help operate the site, such as providers used for hosting, data storage, or image handling. Those providers may process information only as needed to provide their services.",
        ],
      },
      {
        title: "Cookies and device storage",
        paragraphs: [
          "The site uses authentication cookies and browser storage to keep account features working. See our Cookie Policy for more detail and for ways to manage cookies in your browser.",
        ],
      },
      {
        title: "Advertising and third-party services",
        paragraphs: [
          "The site may load third-party content such as hosted fonts and travel photography. Those providers may receive technical information, including your IP address, when your browser requests their content; their own privacy policies apply.",
          "If Google AdSense is enabled, Google and its partners may use cookies or similar technologies to serve, measure, and personalize ads, subject to your settings and applicable requirements. You can learn more about how Google uses information at https://policies.google.com/technologies/partner-sites and manage Google ad personalization at https://adssettings.google.com.",
        ],
      },
      {
        title: "Retention and your choices",
        paragraphs: [
          "We keep account information while it is needed to provide your account and its features. To ask about access, correction, or deletion of information associated with your account, contact us at yeoleharsh577@gmail.com. We may retain limited information where needed for security, legal obligations, or the resolution of disputes.",
          "You can manage cookies through your browser settings. Blocking essential cookies or clearing site storage may prevent sign-in or other account features from working correctly.",
        ],
      },
      {
        title: "Children's privacy and policy updates",
        paragraphs: [
          "Wanderlust is not designed to collect personal information from children who are not permitted to use online services under the laws that apply to them. If you believe a child has provided personal information, contact us so we can review the request.",
          "We may update this policy as the site changes. The date above indicates when the current version was last revised.",
        ],
      },
    ]}
  />
);

export const CookiePolicy = () => (
  <InfoPage
    title="Cookie policy"
    intro="Wanderlust uses cookies and browser storage to provide sign-in and account features. Third-party services may also use their own technologies when their content is loaded."
    sections={[
      {
        title: "Essential authentication technologies",
        paragraphs: [
          "When you sign in, the service uses authentication cookies to recognize your session. The site also stores an access token in your browser's local storage for authenticated requests. These technologies support account features such as trips, favorites, and profile management.",
        ],
      },
      {
        title: "Third-party content and advertising",
        paragraphs: [
          "Some pages load images or fonts from third-party providers. Your browser may contact those providers directly to retrieve that content.",
          "If Google AdSense is enabled, Google may use cookies or similar technologies to serve ads, limit repeated ads, measure performance, and personalize advertising where permitted. Learn more at https://policies.google.com/technologies/ads and manage personalization at https://adssettings.google.com.",
        ],
      },
      {
        title: "Your choices",
        paragraphs: [
          "Most browsers let you review, block, or delete cookies in their settings. If you block essential authentication technologies or clear local storage, some sign-in features may stop working until you sign in again.",
        ],
      },
    ]}
  />
);

export const TermsOfService = () => (
  <InfoPage
    title="Terms of service"
    intro="By using Wanderlust, you agree to use the site responsibly and to follow these terms."
    sections={[
      {
        title: "Using the service",
        paragraphs: [
          "Wanderlust provides destination inspiration and tools to organize travel ideas, trips, itineraries, favorites, invitations, and gallery posts. You are responsible for keeping your account credentials secure and for activity carried out through your account.",
          "You agree not to misuse the site, interfere with its operation, attempt unauthorized access, or use it in a way that violates applicable law or another person's rights.",
        ],
      },
      {
        title: "Your content",
        paragraphs: [
          "You remain responsible for content you submit. You must have the rights and permissions needed to share it. By submitting content, you allow Wanderlust to host, store, display, and transmit it as needed to provide the features you choose, including displaying posts you mark as public and sharing trip information with invited collaborators.",
          "Do not post unlawful, misleading, abusive, or private information about another person. We may remove content or restrict access when reasonably necessary to operate the service or address misuse.",
        ],
      },
      {
        title: "Travel information",
        paragraphs: [
          "Destination information and user contributions are provided for general planning and inspiration. Details can change and may be incomplete or inaccurate. Verify travel, safety, entry, transport, and booking information with authoritative sources before relying on it. Wanderlust does not book or provide travel services.",
        ],
      },
      {
        title: "Availability and changes",
        paragraphs: [
          "We work to keep the service available but do not guarantee uninterrupted or error-free operation. Features may change or be discontinued as the site develops.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Questions about these terms? Contact yeoleharsh577@gmail.com.",
        ],
      },
    ]}
  />
);
