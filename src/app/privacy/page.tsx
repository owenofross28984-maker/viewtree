export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6 text-sm text-muted-foreground">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <p>
          ViewTree ("we", "us", or "our") is a personal project that helps you document and share your
          views. This Privacy Policy explains how we collect, use, and protect your information when you use
          viewtr.ee (the "Service").
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Information we collect</h2>
        <ul className="space-y-1 list-disc pl-5">
          <li>
            <span className="font-medium text-foreground">Account information.</span> When you sign up we
            collect your email address and a password. During onboarding you choose a username, and you may
            optionally add a display name, bio, and theme settings.
          </li>
          <li>
            <span className="font-medium text-foreground">Content you create.</span> This includes the
            views you write (statements and descriptions) and any other text you submit to the Service.
          </li>
          <li>
            <span className="font-medium text-foreground">Usage data.</span> We may collect basic technical
            information such as IP address, browser type, and interaction events to keep the Service reliable
            and improve it over time.
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">2. How we use your information</h2>
        <ul className="space-y-1 list-disc pl-5">
          <li>To create and maintain your account.</li>
          <li>To render your public profile and views when someone visits your page.</li>
          <li>To operate, secure, and improve the Service.</li>
          <li>To communicate with you about important changes or issues with your account.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Public content</h2>
        <p>
          Views you mark as public, and your public profile (username, optional display name, and optional
          bio) are visible to anyone who has your link. Do not post sensitive information in public content.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Data sharing</h2>
        <p>
          We do not sell your personal data. We may use third-party infrastructure providers (for example,
          Supabase for authentication and database hosting) to operate the Service. These providers only
          process your data on our behalf and under appropriate safeguards.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Data retention</h2>
        <p>
          We retain your account data and content for as long as your account is active. You can delete
          content at any time from your dashboard. If you would like your account and data deleted entirely,
          you can contact us using the details below.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Security</h2>
        <p>
          We take reasonable steps to protect your data, but no service can guarantee perfect security.
          Please use a strong, unique password and keep it confidential.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, or delete your personal data.
          You can update most of your profile information directly in the app. For any other requests, please
          reach out using the contact information below.
        </p>

        <h2 className="text-lg font-semibold text-foreground">8. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will change the "Last updated"
          date at the top of this page. Your continued use of the Service after changes become effective
          means you accept the updated policy.
        </p>

        <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
        <p>
          If you have questions about this Privacy Policy or how your data is handled, you can contact the
          creator of ViewTree at the email address listed on the project homepage or repository.
        </p>
      </div>
    </div>
  );
}
