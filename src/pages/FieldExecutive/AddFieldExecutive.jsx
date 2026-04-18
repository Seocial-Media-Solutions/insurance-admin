import React from "react";
import { useNavigate } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";
import { useFieldExecutives } from "../../context/FieldExecutiveContext";

export default function AddFieldExecutive() {
  const navigate = useNavigate();
  const { addExecutive } = useFieldExecutives();

  const handleSubmit = (formData) => {
    return addExecutive(formData).then(() => {
      navigate("/field-executives");
    });
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="add" onSubmit={handleSubmit} />
    </div>
  );
}

