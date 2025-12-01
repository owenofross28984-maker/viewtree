import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViewTree - Your views in one link",
  description: "One page. Always current. Nothing else.",
  keywords: [
    "views",
    "opinions",
    "link in bio",
    "personal page",
    "share views",
  ],
  authors: [{ name: "ViewTree" }],
  openGraph: {
    title: "ViewTree - Your views in one link",
    description: "One page. Always current. Nothing else.",
    type: "website",
    locale: "en_US",
    siteName: "ViewTree",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViewTree - Your views in one link",
    description: "One page. Always current. Nothing else.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
