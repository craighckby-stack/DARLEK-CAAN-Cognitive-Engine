import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <body
        dir="ltr"
        className="antialiased"
        style={{
          direction: 'ltr',
          textAlign: 'left',
          background: '#000000',
          color: '#e0e0e0',
          fontFamily: 'var(--font-share-tech-mono), monospace',
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        }}
      >
        
        {children}
        <Toaster />
      </body>
    </html>
  );
}

