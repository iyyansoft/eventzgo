import React from "react";

interface EventFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, isSubmitting, isEditing }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-sm text-gray-600">Event form placeholder</div>
      <div className="mt-4">{initialData ? <div>{initialData.title}</div> : <div>Create or edit event</div>}</div>
      <div className="mt-4">
        <button disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded">
          {isEditing ? "Save" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default EventForm;
