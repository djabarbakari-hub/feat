import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { RegisterSW } from "@/components/RegisterSW";
import { RouteGuard } from "@/components/RouteGuard";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "MonProgrammeFit",
  description: "Ton programme sportif personnalisé, avec Coach Abdou BAKARI.",
  applicationName: "MonProgrammeFit",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MonProgrammeFit",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <div className="app-root">
          <AuthProvider>
            <RegisterSW />
            <RouteGuard>{children}</RouteGuard>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
