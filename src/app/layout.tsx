import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import HmrErrorHandler from "@/components/HmrErrorHandler";

export const metadata: Metadata = {
  title: "Git Secret & PII Sanitizer",
  description: "Deep PII and Secret Scanner for GitHub repositories.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          background: '#000000',
          color: '#e0e0e0',
          fontFamily: 'var(--font-share-tech-mono), monospace',
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        }}
      >
        <HmrErrorHandler />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

