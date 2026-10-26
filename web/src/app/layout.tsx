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
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#eceef4] text-[#0f172a] antialiased flex flex-col font-sans selection:bg-[#05389f] selection:text-white">
        {children}
      </body>
    </html>
  );
}
