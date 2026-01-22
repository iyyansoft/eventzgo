import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import ConditionalLayout from "@/components/shared/ConditionalLayout";
import ThreePreloader from "@/components/shared/ThreePreloader";
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
          <ThreePreloader />
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