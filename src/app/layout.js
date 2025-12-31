import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jachu Films Hub - Free Films",
  description: "Download high quality Films",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
          {children}
        </div>
      </body>
    </html>
  );
}