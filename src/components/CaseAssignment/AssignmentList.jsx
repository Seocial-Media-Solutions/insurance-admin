import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../Ui/Pagination";

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortField, setSortField] = useState("assignedDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments(1);
  }, []);

  const fetchAssignments = async (page = 1) => {
    try {
      const response = await axios.get(
        `https://insurance-backend-hvk0.onrender.com/api/assignments`,
        { params: { page, limit } }
      );
      if (response.data.success) {
        setAssignments(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
        setCurrentPage(response.data.currentPage || page);
      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchAssignments(page);
    }
  };

  const handleDelete = (assignmentId) => {
    toast((t) => (
      <div className="bg-white text-gray-950">
        <p className="text-sm mb-2">
          Are you sure you want to delete this assignment?
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                toast.dismiss(t.id);
                toast.promise(
                  axios.delete(
                    `https://insurance-backend-hvk0.onrender.com/api/assignments/${assignmentId}`
                  ),
                  {
                    loading: "Deleting assignment...",
                    success: () => {
                      fetchAssignments(currentPage);
                      return "Assignment deleted successfully!";
                    },
                    error: "Failed to delete assignment",
                  }
                );
              } catch (err) {
                toast.error("Something went wrong");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition"
          >
            Confirm
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-xs transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-gray-100 text-gray-800",
      Medium: "bg-blue-100 text-blue-800",
      High: "bg-orange-100 text-orange-800",
      Urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.Pending;
  };

  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch =
        assignment.caseId?.ourFileNo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.caseId?.vehicleNo
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.caseId?.nameOfInsured
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.fieldExecutiveId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || assignment.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || assignment.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "caseId") {
        aValue = a.caseId?.ourFileNo;
        bValue = b.caseId?.ourFileNo;
      } else if (sortField === "fieldExecutiveId") {
        aValue = a.fieldExecutiveId?.fullName;
        bValue = b.fieldExecutiveId?.fullName;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by File No, Vehicle No, Insured Name, or Executive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("caseId")}
              >
                <div className="flex items-center space-x-1">
                  <span>Case Details</span>
                  <SortIcon field="caseId" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("fieldExecutiveId")}
              >
                <div className="flex items-center space-x-1">
                  <span>Field Executive</span>
                  <SortIcon field="fieldExecutiveId" />
                </div>
              </th>
              {/* UPDATED HEADER: Was Visit Details */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investigation Visits
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  <SortIcon field="priority" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("assignedDate")}
              >
                <div className="flex items-center space-x-1">
                  <span>Assigned Date</span>
                  <SortIcon field="assignedDate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No assignments found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.caseId?.ourFileNo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.caseId?.vehicleNo}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.caseId?.nameOfInsured}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.fieldExecutiveId?.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.fieldExecutiveId?.contactNumber}
                    </div>
                  </td>
                  {/* UPDATED COLUMN: Display investigation visits array */}
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-2 h-24 w-60 overflow-y-auto">
                      {assignment.investigationVisits &&
                        assignment.investigationVisits.length > 0 ? (
                        assignment.investigationVisits.map((visit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex justify-center items-center px-2 py-1 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-400"
                          >
                            {visit.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        assignment.priority
                      )}`}
                    >
                      {assignment.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.createdAt // Changed from assignedDate if you don't have that field explicitly, otherwise keep assignedDate
                      ? new Date(assignment.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* <button
                        onClick={() =>
                          navigate(`/cases/assignments/view/${assignment._id}`)
                        }
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/cases/assignments/edit/${assignment._id}`)
                        }
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit Assignment"
                      >
                        <Edit className="h-4 w-4" />
                      </button> */}

                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {assignments.length} of {total} assignments
          </span>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
              Pending:{" "}
              {assignments.filter((a) => a.status === "Pending").length}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
              In Progress:{" "}
              {assignments.filter((a) => a.status === "In Progress").length}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
              Completed:{" "}
              {assignments.filter((a) => a.status === "Completed").length}
            </span>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={goToPage}
      />
    </div>
  );
};

export default AssignmentList;
