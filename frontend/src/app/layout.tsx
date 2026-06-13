import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daniel Skerman | Student Loan Calculator ",
  description:
    "Free UK student loan repayment calculator. Estimate repayments, interest, and total cost based on salary and loan type.",
  keywords: [
    "student loan calculator UK",
    "UK student loan repayment",
    "student finance calculator",
    "loan repayment estimator",
  ],
  authors: [{ name: "Daniel Skerman" }],
  creator: "Daniel Skerman",
  openGraph: {
    title: "Student Loan Calculator",
    description:
      "Estimate UK student loan repayments, interest, and total cost.",
    url: "https://studentloancalculator.danielskerman.com",
    siteName: "Student Loan Calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Loan Calculator",
    description:
      "Estimate UK student loan repayments and total loan cost.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Student Loan Calculator",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              author: {
                "@type": "Person",
                name: "Daniel Skerman",
              },
              url: "https://studentloancalculator.danielskerman.com",
              description:
                "UK student loan repayment calculator to estimate repayments, interest, and total cost.",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
