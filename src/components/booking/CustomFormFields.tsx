"use client";

import React from "react";

interface CustomField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface CustomFormFieldsProps {
  fields: CustomField[];
  values: { [key: string]: string };
  onChange: (fieldId: string, value: string) => void;
  errors: { [key: string]: string };
}

const CustomFormFields: React.FC<CustomFormFieldsProps> = ({
  fields,
  values,
  onChange,
  errors,
}) => {
  const renderField = (field: CustomField) => {
    const commonProps = {
      id: field.id,
      required: field.required,
      value: values[field.id] || "",
      onChange: (e: any) => onChange(field.id, e.target.value),
      className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[field.id] ? "border-red-500" : "border-gray-300"
        }`,
      placeholder: field.placeholder || "",
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "date":
        return <input type={field.type} {...commonProps} />;

      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={commonProps.className + " resize-none"}
          />
        );

      case "select":
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={values[field.id] === "true"}
              onChange={(e) => onChange(field.id, e.target.checked.toString())}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor={field.id} className="text-gray-700">
              {field.label}
            </label>
          </div>
        );

      default:
        return <input type="text" {...commonProps} />;
    }
  };

  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          {field.type !== "checkbox" && (
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomFormFields;