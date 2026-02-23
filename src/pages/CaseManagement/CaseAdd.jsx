import React from "react";
import CaseForm from "../../components/Case/CaseForm";
import { useCases } from "../../context/useCases";
import { useNavigate } from "react-router-dom";

export default function CaseAdd() {
  const { addNewCase } = useCases();
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    addNewCase(data);
    navigate("/cases");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Case</h1>
      <CaseForm onSubmit={handleSubmit} />
    </div>
  );
}
