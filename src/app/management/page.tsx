// src/app/management/page.tsx - YOUR UI with Clerk integration
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
    Star,
    ArrowRight,
    CheckCircle,
    Shield,
    Zap,
    Globe,
    Users,
    Building,
} from "lucide-react";
import ManagementHeader from "@/components/management/ManagementHeader";
import ManagementFooter from "@/components/management/ManagementFooter";

export default function ManagementLanding() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (isLoaded && user) {
            const role = user.publicMetadata?.role as string;
            if (role === "admin") {
                router.push("/admin/dashboard");
            } else if (role === "organiser") {
                const onboardingCompleted = user.publicMetadata?.onboardingCompleted;
                const status = user.publicMetadata?.status;

                if (!onboardingCompleted) {
                    router.push("/management/onboarding");
                } else if (status === "pending") {
                    router.push("/management/pending-approval");
                } else if (status === "approved") {
                    router.push("/management/organiser/dashboard");
                }
            }
        }
    }, [isLoaded, user, router]);

    const featuredManagementItems = [
        {
            id: 1,
            title: "Event Command Center",
            category: "Organizers",
            date: "Launch Ready",
            time: "Real-time Control",
            venue: "Digital Platform",
            location: "Cloud-Based",
            price: "Free Start",
            rating: 4.9,
            image:
                "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
            featured: true,
            description:
                "Complete event orchestration with AI-powered insights and automation",
            gradient: "from-blue-600 via-purple-600 to-indigo-700",
            icon: "🎯",
        },
        {
            id: 2,
            title: "Vendor Ecosystem Hub",
            category: "Vendors",
            date: "Join Network",
            time: "Instant Connect",
            venue: "Marketplace",
            location: "Pan-India",
            price: "Success Fee",
            rating: 4.8,
            image:
                "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
            featured: true,
            description:
                "Smart vendor matching with automated booking and payment systems",
            gradient: "from-green-500 via-emerald-600 to-teal-700",
            icon: "🏪",
        },
        {
            id: 3,
            title: "Speaker Spotlight Network",
            category: "Speakers",
            date: "Go Live",
            time: "Global Reach",
            venue: "Expert Platform",
            location: "Worldwide",
            price: "Premium Rates",
            rating: 4.9,
            image:
                "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
            featured: true,
            description:
                "Elite speaker network with AI-powered topic matching and audience analytics",
            gradient: "from-purple-600 via-pink-600 to-rose-700",
            icon: "🎤",
        },
        {
            id: 4,
            title: "Brand Partnership Engine",
            category: "Sponsors",
            date: "Scale Impact",
            time: "ROI Tracking",
            venue: "Brand Studio",
            location: "Multi-Channel",
            price: "ROI Driven",
            rating: 4.7,
            image:
                "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800",
            featured: true,
            description:
                "Advanced sponsorship platform with real-time ROI tracking and brand analytics",
            gradient: "from-yellow-500 via-orange-600 to-red-700",
            icon: "💎",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredManagementItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredManagementItems.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredManagementItems.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) =>
                (prev - 1 + featuredManagementItems.length) %
                featuredManagementItems.length
        );
    };

    const handleGetStarted = () => {
        // If not authenticated, scroll to features
        if (!user) {
            const featuresSection = document.querySelector("#features-section");
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const handleRoleSelected = (
        role: "organizer" | "vendor" | "speaker" | "sponsor"
    ) => {
        const roleMap = {
            organizer: "organiser",
            vendor: "vendor",
            speaker: "speaker",
            sponsor: "sponsor",
        };
        const schemaRole = roleMap[role];
        router.push(`/management/sign-up?role=${schemaRole}`);
    };

    const handleExploreFeatures = () => {
        const featuresSection = document.querySelector("#features-section");
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleViewFeaturedItem = () => {
        const currentItem = featuredManagementItems[currentSlide];
        if (currentItem) {
            handleGetStarted();
        }
    };

    const getCardPosition = (index: number) => {
        const diff = index - currentSlide;
        const totalCards = featuredManagementItems.length;

        if (diff === 0) return "center";
        if (diff === 1 || diff === -(totalCards - 1)) return "right";
        if (diff === -1 || diff === totalCards - 1) return "left";
        if (diff === 2 || diff === -(totalCards - 2)) return "far-right";
        if (diff === -2 || diff === totalCards - 2) return "far-left";
        return "hidden";
    };

    const getCardStyle = (position: string) => {
        const styles = {
            center: "translate-x-0 scale-110 z-30 opacity-100 rotate-0",
            left: "sm:-translate-x-48 md:-translate-x-64 scale-90 sm:scale-95 z-20 opacity-70 sm:opacity-80 -rotate-6 sm:-rotate-12",
            right:
                "sm:translate-x-48 md:translate-x-64 scale-90 sm:scale-95 z-20 opacity-70 sm:opacity-80 rotate-6 sm:rotate-12",
            "far-left":
                "sm:-translate-x-72 md:-translate-x-96 scale-75 z-10 opacity-30 sm:opacity-40 -rotate-12 sm:-rotate-24",
            "far-right":
                "sm:translate-x-72 md:translate-x-96 scale-75 z-10 opacity-30 sm:opacity-40 rotate-12 sm:rotate-24",
            hidden: "translate-x-0 scale-50 z-0 opacity-0",
        };
        return styles[position as keyof typeof styles] || styles.hidden;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Management Header */}
            <ManagementHeader />

            {/* Hero Section */}
            <section className="relative min-h-screen w-full overflow-hidden pt-16">
                {/* Background with diagonal clip - Same as your UI */}
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `
                url('/concert-background.png'),
                url('https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1600'),
                linear-gradient(135deg, #667eea 0%, #764ba2 100%)
              `,
                            clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
                        style={{
                            clipPath: "polygon(0 0, 75% 0, 100% 100%, 0 100%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
                        style={{
                            clipPath: "polygon(75% 0, 100% 0, 100% 100%, 100% 100%)",
                        }}
                    />
                    <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left Side - Text Content */}
                        <div className="text-left order-2 lg:order-1">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                                Orchestrate Amazing
                                <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                                    Events
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-6 sm:mb-8 leading-relaxed drop-shadow-lg">
                                The ultimate platform connecting organizers, vendors, speakers &
                                sponsors
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={handleExploreFeatures}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
                                >
                                    Explore Platform
                                </button>
                                <button
                                    onClick={handleViewFeaturedItem}
                                    className="bg-white/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
                                >
                                    View Featured
                                </button>
                            </div>
                        </div>

                        {/* Right Side - 3D Card Carousel */}
                        <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[420px] perspective-1000 order-1 lg:order-2">
                            {featuredManagementItems.map((item, index) => {
                                const position = getCardPosition(index);
                                const isCenter = position === "center";

                                return (
                                    <div
                                        key={item.id}
                                        className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-48 sm:w-64 md:w-72 lg:w-80 h-64 sm:h-80 md:h-88 lg:h-96 transition-all duration-700 ease-out cursor-pointer
                      ${getCardStyle(position)}`}
                                        onClick={() => setCurrentSlide(index)}
                                    >
                                        <div
                                            className={`relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl
                      ${isCenter ? "shadow-purple-300/50" : "shadow-gray-300/50"
                                                }
                      hover:shadow-2xl transition-all duration-300`}
                                        >
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
                                            ></div>
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                width={320}
                                                height={256}
                                                className="w-full h-full object-cover mix-blend-overlay opacity-60"
                                                loading="lazy"
                                                unoptimized
                                            />

                                            <div className="absolute inset-0 opacity-20">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full transform translate-x-16 -translate-y-16 animate-pulse"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12 animate-pulse delay-1000"></div>
                                            </div>

                                            {item.featured && (
                                                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full border border-white/30 flex items-center space-x-1">
                                                    <span>{item.icon}</span>
                                                    <span>FEATURED</span>
                                                </div>
                                            )}

                                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 sm:px-3 py-1 rounded-full border border-white/30 flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                <span>{item.category}</span>
                                            </div>

                                            <div className="absolute top-8 sm:top-16 right-2 sm:right-4 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 border border-white/30">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span className="text-xs font-medium text-white">
                                                    {item.rating}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                                                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-white/80 mb-2 sm:mb-3 hidden sm:block line-clamp-2">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between mb-2 sm:mb-4">
                                                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span className="hidden sm:inline">
                                                                {item.date}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{item.location}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-white/60 mb-1">
                                                            Starting
                                                        </p>
                                                        <p className="text-sm sm:text-lg md:text-xl font-bold text-white">
                                                            {item.price}
                                                        </p>
                                                    </div>

                                                    {isCenter && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleGetStarted();
                                                            }}
                                                            className="bg-white/20 backdrop-blur-sm border border-white/30
                              text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm
                              hover:bg-white/30 transform hover:scale-105 
                              transition-all duration-200 shadow-lg"
                                                        >
                                                            Join Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 sm:space-x-6">
                        <button
                            onClick={prevSlide}
                            className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
                        >
                            <ChevronLeft className="w-4 sm:w-6 h-4 sm:h-6" />
                        </button>

                        <div className="flex space-x-2">
                            {featuredManagementItems.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-200 ${index === currentSlide ? "bg-white" : "bg-white/40"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
                        >
                            <ChevronRight className="w-4 sm:w-6 h-4 sm:h-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features-section" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Advanced features designed to streamline event management and
                            maximize success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-8 h-8 text-yellow-600" />,
                                title: "AI-Powered Matching",
                                description:
                                    "Smart algorithms connect you with the perfect partners based on your requirements and past performance.",
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-green-600" />,
                                title: "Secure Payments",
                                description:
                                    "End-to-end encrypted payment processing with escrow protection for all transactions.",
                            },
                            {
                                icon: <Globe className="w-8 h-8 text-blue-600" />,
                                title: "Global Network",
                                description:
                                    "Access to verified professionals across India with international expansion capabilities.",
                            },
                            {
                                icon: <Users className="w-8 h-8 text-purple-600" />,
                                title: "Collaborative Tools",
                                description:
                                    "Real-time collaboration features with integrated communication and project management.",
                            },
                            {
                                icon: <CheckCircle className="w-8 h-8 text-green-600" />,
                                title: "Quality Assurance",
                                description:
                                    "Rigorous verification process and performance tracking to ensure top-quality partnerships.",
                            },
                            {
                                icon: <Building className="w-8 h-8 text-indigo-600" />,
                                title: "Enterprise Ready",
                                description:
                                    "Scalable infrastructure supporting events from intimate gatherings to massive conferences.",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about-section" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Revolutionizing Event Management
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Our platform brings together the entire event ecosystem under
                                one roof. From initial planning to post-event analytics, we
                                provide the tools and connections you need to create
                                unforgettable experiences.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "10,000+ verified professionals",
                                    "500+ successful events monthly",
                                    "98% customer satisfaction rate",
                                    "24/7 dedicated support",
                                ].map((stat, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-gray-700">{stat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                                alt="Event Management"
                                width={600}
                                height={400}
                                className="rounded-2xl shadow-2xl"
                                loading="lazy"
                                unoptimized
                            />
                            <div className="absolute -bottom-6 -left-6 bg-purple-600 text-white p-6 rounded-2xl shadow-xl">
                                <div className="text-2xl font-bold">50K+</div>
                                <div className="text-purple-200">Events Managed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Events?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Join thousands of professionals who trust our platform for their
                        event success
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleGetStarted}
                            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={() => router.push("/management/sign-in")}
                            className="bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-800 transition-all duration-200 border-2 border-purple-400"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <ManagementFooter />
        </div>
    );
}