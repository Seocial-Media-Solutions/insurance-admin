import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Edit } from "lucide-react";
import { useCases } from "../../context/CaseContext";
import { useAssignments } from "../../context/AssignmentContext";

export default function CaseView() {
  const { caseId } = useParams();
  const { getCaseById } = useCases();
  const { getAssignmentsByCaseId } = useAssignments();

  const [caseData, setCaseData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Case Data
      const cData = await getCaseById(caseId);
      if (cData) setCaseData(cData);

      // Fetch Assignments
      setLoadingAssignments(true);
      const aData = await getAssignmentsByCaseId(caseId);
      if (aData) setAssignments(aData);
      setLoadingAssignments(false);
    };
    fetchData();
  }, [caseId]);

  if (!caseData) {
    return <div className="p-6 text-center">Loading case details...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <Link to="/cases" className="text-gray-600 flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Cases
        </Link>
        <Link
          to={`/cases/edit/${caseData._id}`}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <Edit size={16} /> Edit Case
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Case Details</h1>

      <div className="grid grid-cols-2 gap-4">
        <div><strong>Our File No:</strong> {caseData.ourFileNo}</div>
        <div><strong>Policy No:</strong> {caseData.policyNo}</div>
        <div><strong>Vehicle No:</strong> {caseData.vehicleNo}</div>
        <div><strong>Name of Insured:</strong> {caseData.nameOfInsured}</div>
        <div><strong>Contact No:</strong> {caseData.contactNo}</div>
        <div><strong>Status:</strong> {caseData.status}</div>
        <div><strong>Date of Case Rec:</strong> {caseData.dtOfCaseRec}</div>
        <div><strong>Date of Loss:</strong> {caseData.dateOfLoss}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {loadingAssignments ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No assignments found for this case</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Found <span className="font-semibold text-indigo-600">{assignments.length}</span> assignment{assignments.length !== 1 ? 's' : ''}
            </p>

            {/* Assignment Cards */}
            <div className="space-y-4">
              {assignments.map((assignment, idx) => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Assignment Header */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Assignment #{idx + 1}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            assignment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {assignment.status || 'Pending'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${assignment.priority === 'high' ? 'bg-red-100 text-red-700' :
                          assignment.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {assignment.priority || 'medium'} priority
                        </span>
                      </div>
                      <span className="font-mono text-xs text-gray-500">{assignment._id}</span>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Field Executive</p>
                        <p className="text-sm text-gray-900 font-medium">{assignment.fieldExecutiveId || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Assigned Date</p>
                        <p className="text-sm text-gray-900">
                          {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact Person</p>
                        <p className="text-sm text-gray-900">{assignment.contactPersonName || '--'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact Phone</p>
                        <p className="text-sm text-gray-900 font-mono">{assignment.contactPersonPhone || '--'}</p>
                      </div>
                    </div>

                    {/* Investigation Visits */}
                    {assignment.investigationVisits && assignment.investigationVisits.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
                          Investigation Visits ({assignment.investigationVisits.length})
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {assignment.investigationVisits.map((visit, vIdx) => (
                            <div key={vIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${visit.status === 'Completed' ? 'bg-green-500' :
                                  visit.status === 'In Progress' ? 'bg-blue-500' :
                                    'bg-gray-400'
                                  }`}></span>
                                <span className="text-sm text-gray-700">{visit.label}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                visit.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                {visit.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
