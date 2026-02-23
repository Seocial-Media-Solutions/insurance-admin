import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCases } from "../../context/useCases";

import CaseForm from "../../components/Case/CaseForm";
import { ArrowLeft } from "lucide-react";

export default function CaseEdit() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { updateExistingCase, getCaseById } = useCases();
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      const data = await getCaseById(caseId);
      if (data) setCaseData(data);
    };
    fetchCase();
  }, [caseId]);

  const handleSubmit = (updatedData) => {
    updateExistingCase(caseId, updatedData);
    navigate(`/cases/view/${caseId}`);
  };

  if (!caseData) {
    return <div className="p-6 text-center">Loading case data...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit Case</h1>
      <CaseForm initialData={caseData} onSubmit={handleSubmit} />
    </div>
  );
}
