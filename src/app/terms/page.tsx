export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6 text-sm text-muted-foreground">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of ViewTree (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) and the
          viewtr.ee website (the &quot;Service&quot;). By creating an account or using the Service, you agree to be
          bound by these Terms.
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Use of the Service</h2>
        <ul className="space-y-1 list-disc pl-5">
          <li>You must be at least 13 years old to use the Service.</li>
          <li>You are responsible for maintaining the confidentiality of your account and password.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">2. Your content</h2>
        <p>
          You retain ownership of the content you create on ViewTree. By posting content on the Service, you
          grant us a non-exclusive, worldwide, royalty-free license to store, display, and distribute that
          content as necessary to operate the Service.
        </p>
        <p>
          You are responsible for ensuring that your content complies with applicable laws and that you have
          the rights to share it.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Acceptable use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="space-y-1 list-disc pl-5">
          <li>Engage in harassment, hate speech, or threats of violence.</li>
          <li>Post illegal content or content that infringes on others&apos; intellectual property.</li>
          <li>Attempt to interfere with or disrupt the integrity or performance of the Service.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">4. Public profiles and links</h2>
        <p>
          Your username and any public views you create may be accessible to anyone with your
          viewtr.ee/@username link. Do not include sensitive information in your public content.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time if we reasonably believe you
          have violated these Terms or are using the Service in a way that could harm others or the
          infrastructure.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Disclaimer of warranties</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express
          or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, ViewTree and its creator will not be liable for any
          indirect, incidental, special, or consequential damages arising out of or in connection with your
          use of the Service.
        </p>

        <h2 className="text-lg font-semibold text-foreground">8. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. When we do, we will change the &quot;Last updated&quot; date at
          the top of this page. Your continued use of the Service after changes become effective means you
          accept the updated Terms.
        </p>

        <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
        <p>
          If you have questions about these Terms or the Service, you can contact the creator of ViewTree at
          the email address listed on the project homepage or repository.
        </p>
      </div>
    </div>
  );
}
