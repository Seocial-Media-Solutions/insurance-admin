// FILE: src/components/CaseAssignment/AssignmentDetails.jsx
import React from 'react';
import { X, Calendar, MapPin, Phone, User, FileText, Edit, ClipboardList } from 'lucide-react';

const AssignmentDetails = ({ assignment, onClose, onEdit }) => {
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.Pending;
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-gray-50/30 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              <span>Assignment Details</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-black">{assignment.caseId?.ourFileNo}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
              Case Verification
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">
              Assigned to <span className="text-blue-600 underline underline-offset-4">{assignment.fieldExecutiveId?.fullName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onEdit}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-black rounded-xl transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Case and Executive Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Case Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">File No:</span>
                  <span className="text-gray-900">{assignment.caseId?.ourFileNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Vehicle No:</span>
                  <span className="text-gray-900">{assignment.caseId?.vehicleNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Insured Name:</span>
                  <span className="text-gray-900">{assignment.caseId?.nameOfInsured}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="text-gray-900">{assignment.caseId?.contactNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Policy No:</span>
                  <span className="text-gray-900">{assignment.caseId?.policyNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Date of Loss:</span>
                  <span className="text-gray-900">{assignment.caseId?.dateOfLoss}</span>
                </div>
              </div>
            </div>

            {/* Field Executive Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Field Executive
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{assignment.fieldExecutiveId?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="text-gray-900">{assignment.fieldExecutiveId?.contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-900">{assignment.fieldExecutiveId?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Username:</span>
                  <span className="text-gray-900">{assignment.fieldExecutiveId?.username}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-700">Visit Date</div>
                  <div className="text-gray-900">{formatDate(assignment.visitDate)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-700">Visit Time</div>
                  <div className="text-gray-900">{assignment.visitTime}</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Priority</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-700">Status</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Location and Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Location */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Visit Location
              </h3>
              <p className="text-sm text-gray-700">{assignment.visitLocation}</p>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-600" />
                Contact Person
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{assignment.contactPersonName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{assignment.contactPersonPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions and Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instructions */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions for Executive</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructionsForExecutive}</p>
            </div>

            {/* Documents Required */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents Required</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.documentsRequired}</p>
            </div>
          </div>

          {/* Additional Information */}
          {assignment.remarks && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Remarks</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.remarks}</p>
            </div>
          )}

          {/* Investigation Visits Timeline */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Investigation Visits
            </h3>
            
            <div className="space-y-4">
              {(!assignment.investigationVisits || assignment.investigationVisits.length === 0) ? (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No visits recorded for this assignment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignment.investigationVisits.map((visit, vIdx) => (
                    <div key={vIdx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[12px] font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                          {vIdx + 1}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{visit.label}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{visit.status}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        visit.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                        visit.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Investigation Details */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-[0.2em] mb-6">Investigation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Investigation Type</p>
                <p className="text-sm font-bold text-gray-800">{assignment.investigationType || "Standard"}</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Date</p>
                <p className="text-sm font-bold text-gray-800">{formatDate(assignment.assignedDate)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;