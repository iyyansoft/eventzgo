import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Management Portal - TICKETSHUB",
    description: "Event management platform for organizers, vendors, speakers, and sponsors",
    keywords: ["event management", "organizer", "vendor", "speaker", "sponsor", "event platform"],
    authors: [{ name: "TICKETSHUB" }],
    robots: {
        index: false, // Don't index management portal in search engines
        follow: false,
    },
    openGraph: {
        title: "Management Portal - TICKETSHUB",
        description: "Professional event management platform",
        type: "website",
    },
};
