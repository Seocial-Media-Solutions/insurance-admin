import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";
import { fieldExecutiveService } from "../../services/fieldExecutiveService";
import { useFieldExecutives } from "../../context/FieldExecutiveContext";

export default function EditFieldExecutive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateExecutive } = useFieldExecutives();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fieldExecutiveService.getById(id);
        if (data?.success) setInitialData(data.data);
        else toast.error(data?.message || "Failed to load field executive data");
      } catch (err) {
        toast.error(err?.message || "Error loading field executive");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = (formData) => {
    return updateExecutive(id, formData).then(() => {
      navigate("/field-executives");
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-medium">Loading executive data...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-medium">Failed to load field executive data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
