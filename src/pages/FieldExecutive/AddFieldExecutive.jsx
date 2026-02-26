import React from "react";
import { useNavigate } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";
import { API } from "../../utils/api";
export default function AddFieldExecutive() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const res = await fetch(`${API}/field-executives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Field Executive created successfully!");
      navigate("/field-executives");
    } else {
      toast.error(result.message || "Error creating field executive");
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="add" onSubmit={handleSubmit} />
    </div>
  );
}
