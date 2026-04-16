import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import ToastContainer from "./components/Toast";

export const metadata: Metadata = {
  title: "Easy View - Digital Finance Portal",
  description: "PwC Digital Finance Portal - Easy View Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <Header />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
