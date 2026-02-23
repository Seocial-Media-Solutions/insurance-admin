import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AssignmentDetails from "../../components/CaseAssignment/AssignmentDetails";
import { useAssignments } from "../../context/AssignmentContext";

const AssignmentViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssignmentById } = useAssignments();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const data = await getAssignmentById(id);
      if (data) {
        setAssignment(data);
      } else {
        toast.error("Failed to load assignment details");
      }
    } catch (error) {
      toast.error("Error fetching assignment");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-10 text-gray-500">
        Assignment not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate("/cases/assignments")}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded-md"
        >
          Assignments
        </button>
      </div>

      <AssignmentDetails
        assignment={assignment}
        onClose={() => navigate("/cases/assignments")}
        onEdit={() => navigate(`/cases/assignments/edit/${assignment._id}`)}
      />
    </div>
  );
};

export default AssignmentViewPage;
