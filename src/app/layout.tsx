import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/shared/ConvexClientProvider";
import { LocationProvider } from "@/contexts/LocationContext";
import ConditionalLayout from "@/components/shared/ConditionalLayout";
import SessionProvider from "@/components/providers/SessionProvider";
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
          <SessionProvider>
            <ConvexClientProvider>
              <LocationProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </LocationProvider>
            </ConvexClientProvider>
          </SessionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}