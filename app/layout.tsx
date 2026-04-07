import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuco Message Queue",
  description: "Message Queue Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}