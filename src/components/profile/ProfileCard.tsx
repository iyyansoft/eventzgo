"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { User, Mail, Phone, Calendar, MapPin, Edit } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

export default function ProfileCard() {
  const { user, isSignedIn } = useUser();
  
  const userData = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  if (!userData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
      
      {/* Profile Content */}
      <div className="px-6 pb-6">
        <div className="flex items-start justify-between -mt-16 mb-4">
          <div className="relative">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={(userData.firstName || userData.lastName) ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() : userData.email}
                width={120}
                height={120}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            )}
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
              userData.role === "admin" ? "bg-red-500" :
              userData.role === "organiser" ? "bg-blue-500" :
              "bg-green-500"
            }`}></div>
          </div>

          <button className="mt-16 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{(userData.firstName || userData.lastName) ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() : userData.email}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 capitalize ${
              userData.role === "admin" ? "bg-red-100 text-red-700" :
              userData.role === "organiser" ? "bg-blue-100 text-blue-700" :
              "bg-green-100 text-green-700"
            }`}>
              {userData.role}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{userData.email}</p>
              </div>
            </div>

            {userData.phone && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{userData.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(userData._creationTime), "MMM yyyy")}
                </p>
              </div>
            </div>

            {(userData as any).city && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{(userData as any).city}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}