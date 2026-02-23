import React from "react";
import { useCases } from "../../context/useCases";
import CaseForm from "../../components/Case/CaseForm";


export default function AddCase() {
const { cases, loading, addNewCase, updateExistingCase, removeCase } = useCases();
const handleAddCase = (data) => {
  addNewCase(data);
};
  return <CaseForm onSubmit={handleAddCase} className="animate-slideDown" />;
}
