import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import ConditionalLayout from "@/components/shared/ConditionalLayout";
import ModernGlassPreloader from "@/components/shared/ModernGlassPreloader";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventzGo - Book Events Online",
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
          <ModernGlassPreloader />
          <ConvexClientProvider>
            <LocationProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </LocationProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}