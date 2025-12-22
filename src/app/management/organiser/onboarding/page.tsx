"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import OnboardingWizard from "@/components/organiser/OnboardingWizard";

export default function OrganiserOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Business Details
    businessName: "",
    businessType: "individual",
    description: "",

    // Contact Details
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // GST Details
    gstNumber: "",
    panNumber: "",

    // Bank Details
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",

    // Documents
    gstCertificate: null as File | null,
    panCard: null as File | null,
    cancelledCheque: null as File | null,
  });

  const createOrganiser = useMutation(api.organisers.createOrganiser);
  const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id as string } : "skip");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload documents to Cloudinary
      const documentUrls: any = {};

      if (formData.gstCertificate) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.gstCertificate);
        const response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload GST certificate: ${response.statusText}`);
        }

        const data = await response.json();
        documentUrls.gstCertificate = data.url;
      }

      if (formData.panCard) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.panCard);
        const response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload PAN card: ${response.statusText}`);
        }

        const data = await response.json();
        documentUrls.panCard = data.url;
      }

      if (formData.cancelledCheque) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.cancelledCheque);
        const response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload cancelled cheque: ${response.statusText}`);
        }

        const data = await response.json();
        documentUrls.cancelledCheque = data.url;
      }

      // Create organiser profile (map form fields to Convex args)
      await createOrganiser({
        userId: currentUser?._id as any,
        clerkId: user?.id as string,
        institutionName: formData.businessName,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          branchName: formData.branchName,
        },
        documents: documentUrls,
      });

      router.push("/management/organiser/dashboard");
    } catch (error) {
      console.error("Error submitting organiser application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Become an Organiser
        </h1>
        <p className="text-gray-600">
          Complete your profile to start creating events
        </p>
      </div>

      <OnboardingWizard
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}