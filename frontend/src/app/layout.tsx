import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "bookin | Campus Facility Booking",
  description: "Book lecture halls, labs, and meeting rooms across the University of Ghana campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
