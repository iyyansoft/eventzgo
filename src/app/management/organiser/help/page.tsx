"use client";

import { HelpCircle, Mail, Phone, MessageCircle, FileText, ExternalLink } from "lucide-react";

export default function OrganiserHelpPage() {
    const helpTopics = [
        {
            icon: Calendar,
            title: "Creating Events",
            description: "Learn how to create and manage your events",
            link: "#",
        },
        {
            icon: Users,
            title: "Managing Bookings",
            description: "Handle bookings and customer inquiries",
            link: "#",
        },
        {
            icon: DollarSign,
            title: "Payouts & Billing",
            description: "Understand payment processing and payouts",
            link: "#",
        },
        {
            icon: BarChart3,
            title: "Analytics & Reports",
            description: "Track your performance with analytics",
            link: "#",
        },
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            description: "support@eventzgo.com",
            action: "Send Email",
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "+91 1234567890",
            action: "Call Now",
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with our support team",
            action: "Start Chat",
        },
    ];

    const faqs = [
        {
            question: "How do I create my first event?",
            answer:
                "Navigate to 'My Events' and click on 'Create Event'. Fill in the event details, upload images, set ticket prices, and publish your event.",
        },
        {
            question: "When will I receive my payouts?",
            answer:
                "Payouts are processed within 7 business days after your event concludes. You can track all payouts in the 'Payouts' section.",
        },
        {
            question: "How can I cancel or refund a booking?",
            answer:
                "Go to 'Bookings', find the booking you want to refund, and click on 'Issue Refund'. The amount will be credited back to the customer within 5-7 business days.",
        },
        {
            question: "Can I edit my event after publishing?",
            answer:
                "Yes, you can edit most event details even after publishing. However, major changes like date or venue might require notifying existing ticket holders.",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600 mt-2">
                    We're here to help you succeed
                </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                        <div
                            key={method.title}
                            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {method.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">{method.description}</p>
                            <button className="text-purple-600 font-medium text-sm hover:text-purple-700">
                                {method.action} →
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Help Topics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Popular Help Topics
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {helpTopics.map((topic) => {
                        const Icon = topic.icon;
                        return (
                            <a
                                key={topic.title}
                                href={topic.link}
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                        {topic.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {topic.description}
                                    </p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {faqs.map((faq, index) => (
                        <div key={index} className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 ml-7">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Documentation Link */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-sm p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">
                            Need More Help?
                        </h3>
                        <p className="text-purple-100">
                            Check out our comprehensive documentation and guides
                        </p>
                    </div>
                    <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
}

// Import icons that were referenced
import { Calendar, Users, DollarSign, BarChart3 } from "lucide-react";
