// FILE: src/components/CaseAssignment/AssignmentDetails.jsx
import React from 'react';
import { X, Calendar, MapPin, Phone, User, FileText } from 'lucide-react';

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
    <div className=" flex items-center justify-center p-4 ">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assignment Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Case: {assignment.caseId?.ourFileNo} • Executive: {assignment.fieldExecutiveId?.fullName}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Edit Assignment
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
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

          {/* Investigation Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Investigation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Investigation Type:</span>
                <span className="ml-2 text-gray-900">{assignment.investigationType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Assigned Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(assignment.assignedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;