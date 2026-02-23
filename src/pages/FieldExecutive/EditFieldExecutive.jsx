import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FieldExecutiveForm from "../../components/FieldExecutiveForm";
import toast from "react-hot-toast";

export default function EditFieldExecutive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:5000/api/field-executives/${id}`);
      const data = await res.json();
      if (data.success) setInitialData(data.data);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    const res = await fetch(`http://localhost:5000/api/field-executives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Field Executive updated successfully!");
      navigate("/field-executives");
    } else {
      toast.error(result.message || "Error updating field executive");
    }
  };

  if (!initialData) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <FieldExecutiveForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
