import React from "react";

interface Props {
  currentStep: number;
  setCurrentStep: (n: number) => void;
  formData: any;
  setFormData: (d: any) => void;
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

const OnboardingWizard: React.FC<Props> = ({ currentStep, setCurrentStep, formData, setFormData, onSubmit, isSubmitting }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Organiser Onboarding</h3>
      <p className="text-sm text-gray-600">Step {currentStep} — Complete your organiser profile to start creating events.</p>
      <div className="mt-4">
        <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} className="px-3 py-2 mr-2 bg-gray-200 rounded">Back</button>
        <button onClick={() => setCurrentStep(currentStep + 1)} className="px-3 py-2 mr-2 bg-gray-200 rounded">Next</button>
        <button onClick={onSubmit} disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded">{isSubmitting ? 'Submitting...' : 'Submit'}</button>
      </div>
    </div>
  );
};

export default OnboardingWizard;
