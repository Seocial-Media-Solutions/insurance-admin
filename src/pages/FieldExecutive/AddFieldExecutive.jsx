import React from "react";
import { useNavigate } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";
import { fieldExecutiveService } from "../../services/fieldExecutiveService";

export default function AddFieldExecutive() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const result = await fieldExecutiveService.create(formData);
      if (result.success) {
        // toast.success handled by service toast.promise
        navigate("/field-executives");
      }
    } catch (err) {
      console.error("Error creating executive:", err);
      // toast.error handled by service toast.promise
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="add" onSubmit={handleSubmit} />
    </div>
  );
}

