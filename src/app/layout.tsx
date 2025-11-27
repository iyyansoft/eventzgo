import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventsGo - Book Events Online",
  description: "India's premier event ticketing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ConvexClientProvider>
            <LocationProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </LocationProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}