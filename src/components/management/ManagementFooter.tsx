// src/components/management/ManagementFooter.tsx - Separate footer component
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ManagementFooter() {
    const router = useRouter();

    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/eventzgo_logo.png"
                                    alt="EventzGo"
                                    width={144}
                                    height={36}
                                    className="h-9 w-auto brightness-0 invert"
                                />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Management Portal</div>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            The ultimate platform for event professionals. Connect,
                            collaborate, and create extraordinary experiences together.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center space-x-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span>Visit Main Site</span>
                        </button>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    For Organizers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    For Vendors
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    For Speakers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    For Sponsors
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 EventzGo Management. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}