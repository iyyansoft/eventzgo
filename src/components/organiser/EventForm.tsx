"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Type,
  CheckSquare,
  Circle,
  List,
  Mail,
  Phone,
  Hash,
  Shield,
} from "lucide-react";

interface EventFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

interface CustomField {
  id: string;
  type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
}


interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
  id?: string;
}

interface EventFormData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  ticketTypes: TicketType[];
  coverImage: string;
  galleryImages: string[];
  customFields: CustomField[];
  cancellationPolicy: {
    isCancellable: boolean;
    refundPercentage: number;
    deadlineHoursBeforeStart: number;
    description: string;
  };
  // Mega Event Fields
  isMegaEvent: boolean;
  organizationName?: string; // For mega events (e.g., "Anna University Tech Fest")
  departments?: Department[]; // List of departments with their events
}

interface Department {
  id: string;
  name: string; // CSE, EEE, ECE, MECH, etc.
  eventCount: number; // How many events this department will create
  events: SubEvent[]; // The actual events for this department
}

interface SubEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  ticketTypes: TicketType[];
  coverImage: string;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditing,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>(() => {
    const d = initialData || {};
    const venueObj = typeof d.venue === 'object' ? d.venue : null;
    const venueName = typeof d.venue === 'string' ? d.venue : venueObj?.name || "";

    const formatDate = (ts?: number) => {
      if (!ts) return "";
      const date = new Date(ts);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatTime = (ts?: number) => {
      if (!ts) return "";
      const date = new Date(ts);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      // Basic Info
      title: d.title || "",
      description: d.description || "",
      category: d.category || "",

      // Date & Time
      startDate: formatDate(d.dateTime?.start) || d.startDate || "",
      endDate: formatDate(d.dateTime?.end) || d.endDate || "",
      startTime: formatTime(d.dateTime?.start) || d.startTime || "",
      endTime: formatTime(d.dateTime?.end) || d.endTime || "",

      // Location
      venue: venueName,
      address: venueObj?.address || d.address || "",
      city: venueObj?.city || d.city || "",
      state: venueObj?.state || d.state || "",
      pincode: venueObj?.pincode || d.pincode || "",

      // Tickets
      ticketTypes: d.ticketTypes || [
        { name: "General Admission", price: 0, quantity: 100, description: "" }
      ],

      // Media
      coverImage: d.bannerImage || d.coverImage || "",
      galleryImages: d.galleryImages || [],

      // Custom Registration Form
      customFields: d.customFields || [],

      // Policies
      cancellationPolicy: d.cancellationPolicy || {
        isCancellable: false,
        refundPercentage: 0,
        deadlineHoursBeforeStart: 24,
        description: ""
      },

      // Mega Event
      isMegaEvent: d.isMegaEvent || false,
      organizationName: d.organizationName || "",
      departments: d.departments || [],
    };
  });

  const [customFields, setCustomFields] = useState<CustomField[]>(
    initialData?.customFields || []
  );

  const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Concert",
    "Festival",
    "Sports",
    "Exhibition",
    "Networking",
    "Other",
  ];

  const fieldTypes = [
    { value: "text", label: "Short Text", icon: Type },
    { value: "textarea", label: "Long Text", icon: FileText },
    { value: "email", label: "Email", icon: Mail },
    { value: "phone", label: "Phone", icon: Phone },
    { value: "number", label: "Number", icon: Hash },
    { value: "select", label: "Dropdown", icon: List },
    { value: "radio", label: "Multiple Choice", icon: Circle },
    { value: "checkbox", label: "Checkboxes", icon: CheckSquare },
  ];

  // Cookie helper functions
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // Load saved form data from cookie on mount
  useEffect(() => {
    if (!isEditing) {
      const savedData = getCookie('eventFormDraft');
      const savedCustomFields = getCookie('eventFormCustomFields');
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(savedData));
          setFormData(parsedData);
        } catch (e) {
          console.error('Failed to parse saved form data');
        }
      }
      
      if (savedCustomFields) {
        try {
          const parsedFields = JSON.parse(decodeURIComponent(savedCustomFields));
          setCustomFields(parsedFields);
        } catch (e) {
          console.error('Failed to parse saved custom fields');
        }
      }
    }
  }, [isEditing]);

  // Auto-save form data to cookie whenever it changes
  useEffect(() => {
    if (!isEditing && formData.title) { // Only save if there's some content
      const dataToSave = JSON.stringify(formData);
      setCookie('eventFormDraft', encodeURIComponent(dataToSave), 7);
    }
  }, [formData, isEditing]);

  // Auto-save custom fields to cookie
  useEffect(() => {
    if (!isEditing && customFields.length > 0) {
      const fieldsToSave = JSON.stringify(customFields);
      setCookie('eventFormCustomFields', encodeURIComponent(fieldsToSave), 7);
    }
  }, [customFields, isEditing]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [
        ...formData.ticketTypes,
        { name: "", price: 0, quantity: 0, description: "" },
      ],
    });
  };

  const removeTicketType = (index: number) => {
    const newTickets = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData({ ...formData, ticketTypes: newTickets });
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    const newTickets = [...formData.ticketTypes];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setFormData({ ...formData, ticketTypes: newTickets });
  };

  const addCustomField = (type: CustomField["type"]) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      type,
      label: "",
      placeholder: "",
      required: false,
      options: type === "select" || type === "radio" || type === "checkbox" ? [""] : undefined,
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const addOption = (fieldId: string) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === fieldId && field.options
          ? { ...field, options: [...field.options, ""] }
          : field
      )
    );
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === fieldId && field.options
          ? {
            ...field,
            options: field.options.map((opt, i) =>
              i === optionIndex ? value : opt
            ),
          }
          : field
      )
    );
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setCustomFields(
      customFields.map((field) =>
        field.id === fieldId && field.options
          ? {
            ...field,
            options: field.options.filter((_, i) => i !== optionIndex),
          }
          : field
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on the final step (step 6)
    if (currentStep !== 6) {
      return;
    }
    
    if (onSubmit) {
      await onSubmit({ ...formData, customFields });
      // Clear saved draft after successful submission
      deleteCookie('eventFormDraft');
      deleteCookie('eventFormCustomFields');
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Date & Location", icon: MapPin },
    { number: 3, title: "Tickets", icon: IndianRupee },
    { number: 4, title: "Media", icon: ImageIcon },
    { number: 5, title: "Registration", icon: List },
    { number: 6, title: "Policies", icon: Shield },
  ];

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear your saved draft?')) {
      deleteCookie('eventFormDraft');
      deleteCookie('eventFormCustomFields');
      window.location.reload();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-8"
      onKeyDown={(e) => {
        // Prevent form submission on Enter key press in any input field
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
    >
      {/* Auto-save indicator */}
      {!isEditing && formData.title && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Draft auto-saved</span>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear Draft
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-sm mt-2 ${isActive ? "text-purple-600 font-semibold" : "text-gray-600"
                    }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* Mega Event Toggle */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMegaEvent}
                    onChange={(e) => handleInputChange("isMegaEvent", e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                  />
                  <div>
                    <span className="text-lg font-semibold text-gray-900">Create as Mega Event</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Perfect for universities, festivals, or conferences with multiple departments/tracks
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {formData.isMegaEvent && (
              <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Mega Event Configuration</h3>
                </div>
                
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization/Event Name *
                  </label>
                  <input
                    type="text"
                    required={formData.isMegaEvent}
                    value={formData.organizationName || ""}
                    onChange={(e) => handleInputChange("organizationName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g., Anna University Tech Fest 2024"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The main event name that will contain all department events
                  </p>
                </div>

                {/* Department Management */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Departments & Their Events
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newDept: Department = {
                        id: `dept-${Date.now()}`,
                        name: "",
                        eventCount: 1,
                        events: []
                      };
                      handleInputChange("departments", [...(formData.departments || []), newDept]);
                    }}
                    className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    + Add Department
                  </button>

                  {/* List of Departments */}
                  <div className="space-y-4">
                    {(formData.departments || []).map((dept, deptIndex) => (
                      <div key={dept.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            {/* Department Name */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Department Name
                                </label>
                                <input
                                  type="text"
                                  value={dept.name}
                                  onChange={(e) => {
                                    const updated = [...(formData.departments || [])];
                                    updated[deptIndex].name = e.target.value;
                                    handleInputChange("departments", updated);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="e.g., CSE, EEE, ECE"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Number of Events
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={dept.eventCount}
                                  onChange={(e) => {
                                    const updated = [...(formData.departments || [])];
                                    updated[deptIndex].eventCount = parseInt(e.target.value) || 1;
                                    handleInputChange("departments", updated);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500">
                              {dept.name || "This department"} will create {dept.eventCount} event(s)
                            </p>
                          </div>
                          
                          {/* Remove Department Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.departments || []).filter((_, i) => i !== deptIndex);
                              handleInputChange("departments", updated);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(formData.departments || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      No departments added yet. Click "Add Department" to get started.
                    </p>
                  )}
                </div>

                {/* Summary */}
                {(formData.departments || []).length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">
                      📊 Summary: {(formData.departments || []).length} department(s) will create{" "}
                      {(formData.departments || []).reduce((sum, d) => sum + d.eventCount, 0)} total event(s)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Date & Location */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Date & Location</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                required
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter venue name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Tickets */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Ticket Types</h2>
            <button
              type="button"
              onClick={addTicketType}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Add Ticket Type
            </button>
          </div>

          {formData.ticketTypes.map((ticket, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Ticket Type #{index + 1}
                </h3>
                {formData.ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketType(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicketType(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g., VIP Pass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={ticket.price || ""}
                    onChange={(e) =>
                      updateTicketType(index, "price", e.target.value ? parseFloat(e.target.value) : 0)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={ticket.quantity || ""}
                    onChange={(e) =>
                      updateTicketType(index, "quantity", e.target.value ? parseInt(e.target.value) : 0)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={ticket.description}
                    onChange={(e) =>
                      updateTicketType(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Media */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Event Media</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL *
            </label>
            <input
              type="url"
              required
              value={formData.coverImage}
              onChange={(e) => handleInputChange("coverImage", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.coverImage && (
              <div className="mt-4">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Image upload functionality will be added here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              For now, please use image URLs
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Custom Registration Form */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Custom Registration Form
            </h2>
            <p className="text-gray-600">
              Create custom fields to collect additional information from attendees
            </p>
          </div>

          {/* Field Type Selector */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Add Field</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fieldTypes.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.value}
                    type="button"
                    onClick={() => addCustomField(fieldType.value as any)}
                    className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {fieldType.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Fields List */}
          {customFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Form Fields</h3>
              {customFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-6 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Field #{index + 1} - {field.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={field.label}
                        onChange={(e) =>
                          updateCustomField(field.id, { label: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="e.g., Phone Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          updateCustomField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Optional placeholder"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) =>
                        updateCustomField(field.id, {
                          required: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                    />
                    <label
                      htmlFor={`required-${field.id}`}
                      className="text-sm text-gray-700"
                    >
                      Required field
                    </label>
                  </div>

                  {/* Options for select, radio, checkbox */}
                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox") && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(field.id)}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            + Add Option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(field.id, optIndex, e.target.value)
                                }
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              {field.options && field.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(field.id, optIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {customFields.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No custom fields added yet. Click on a field type above to get
                started.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Policies */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Cancellation & Refund Policy</h2>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="isCancellable"
                checked={formData.cancellationPolicy.isCancellable}
                onChange={(e) => setFormData({
                  ...formData,
                  cancellationPolicy: { ...formData.cancellationPolicy, isCancellable: e.target.checked }
                })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <label htmlFor="isCancellable" className="text-lg font-medium text-gray-900 cursor-pointer">
                Allow Ticket Cancellation
              </label>
            </div>

            {formData.cancellationPolicy.isCancellable && (
              <div className="space-y-6 pl-8 border-l-2 border-gray-100 ml-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Percentage (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.cancellationPolicy.refundPercentage}
                        onChange={(e) => setFormData({
                          ...formData,
                          cancellationPolicy: { ...formData.cancellationPolicy, refundPercentage: Number(e.target.value) }
                        })}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                      <span className="absolute right-4 top-3 text-gray-500">%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Amount refunded to the user (excluding platform fees).
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Deadline (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cancellationPolicy.deadlineHoursBeforeStart}
                      onChange={(e) => setFormData({
                        ...formData,
                        cancellationPolicy: { ...formData.cancellationPolicy, deadlineHoursBeforeStart: Number(e.target.value) }
                      })}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Hours before the event start time after which cancellation is not allowed.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.cancellationPolicy.description || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      cancellationPolicy: { ...formData.cancellationPolicy, description: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="e.g. Full refund if cancelled 48 hours before the event. No refund after that."
                  />
                </div>
              </div>
            )}

            {!formData.cancellationPolicy.isCancellable && (
              <p className="text-gray-500 text-sm mt-2 ml-8">Ticketing will be strictly non-refundable.</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`w-2 h-2 rounded-full ${currentStep === step.number
                ? "bg-purple-600"
                : currentStep > step.number
                  ? "bg-green-500"
                  : "bg-gray-300"
                }`}
            />
          ))}
        </div>

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting
              ? "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Event"}
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
