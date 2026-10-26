import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Banwaan | Naga City 3D Geo-Spatial Intelligence & Decision Support",
  description: "CBMS-driven agentic platform for urban vulnerability analysis, SDG alignment, and evidence-based barangay program generation in Naga City.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f7f8fa] text-[#0a1128] antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
