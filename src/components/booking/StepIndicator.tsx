"use client";

import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step.number < currentStep
                  ? "bg-purple-600 text-white"
                  : step.number === currentStep
                    ? "bg-purple-600 text-white ring-4 ring-purple-200"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
              {step.number < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-sm mt-2 font-medium ${step.number <= currentStep
                  ? "text-purple-600"
                  : "text-gray-400"
                }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-24 mx-2 rounded transition-all duration-300 ${step.number < currentStep ? "bg-purple-600" : "bg-gray-200"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;