import type { Metadata } from "next";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export const metadata: Metadata = {
  title: "FocusPDF",
  description: "Dark focused PDF studying companion"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100">
        {children}
      </body>
    </html>
  );
}
