"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Settings,
} from "lucide-react";

const Footer = () => {
  const router = useRouter();

  const footerSections = [
    {
      title: "Categories",
      links: ["Concerts", "Sports", "Events", "Comedy"],
    },
    {
      title: "Quick Links",
      links: ["About Us", "How it Works", "Careers", "Help Center"],
    },
    {
      title: "For Partners",
      links: [
        "List Your Event",
        "Organizer Tools",
        "Marketing Support",
        "API Access",
      ],
    },
    {
      title: "Support",
      links: [
        "Customer Service",
        "Refund Policy",
        "Terms of Service",
        "Privacy Policy",
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", color: "hover:text-blue-600" },
    { icon: Twitter, href: "#", color: "hover:text-blue-400" },
    { icon: Instagram, href: "#", color: "hover:text-pink-600" },
    { icon: Youtube, href: "#", color: "hover:text-red-600" },
  ];

  const handleManagementClick = () => {
    router.push("/coming-soon");
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Management Portal CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">
                Are you an Event Organizer?
              </h3>
              <p className="text-white/90">
                Join our management platform to create and manage events,
                connect with vendors, speakers, and sponsors.
              </p>
            </div>
            <button
              onClick={handleManagementClick}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Management Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Image
              src="/eventzgo_logo.png"
              alt="EVENTSGO"
              width={320}
              height={220}
              className="w-44 h-auto mb-4 brightness-0 invert"
              priority
            />
            <p className="text-gray-400 mb-4 leading-relaxed text-sm">
              Your premier destination for entertainment experiences. From
              live concerts, sports events and more
              shows.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@eventsgo.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Maharashtra</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={`bg-gray-800 p-2 rounded-lg hover:bg-gray-700 ${social.color} transition-all duration-200 hover:scale-110`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-base mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 EVENTSGO. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
