import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";
import { fieldExecutiveService } from "../../services/fieldExecutiveService";

export default function EditFieldExecutive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fieldExecutiveService.getById(id);
        if (data.success) {
          setInitialData(data.data);
        } else {
            toast.error(data.message || "Failed to fetch executive details");
        }
      } catch (err) {
        console.error("Error loading executive:", err);
        // Toast handled by service
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const result = await fieldExecutiveService.update({ id, executiveData: formData });
      if (result.success) {
          // toast.success is already handled by the service toast.promise
          navigate("/field-executives");
      }
    } catch (err) {
      console.error("Error updating executive:", err);
      // toast is already handled by the service toast.promise
    }
  };

  if (!initialData) return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600 font-medium tracking-tight">Loading executive profile...</p>
      </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}

