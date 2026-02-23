import React from "react";
import {
  Home,
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Users,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  setActiveMenu,
}) {
  const location = useLocation();

  const navLinks = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "CaseFirm", icon: Home, path: "/casefirm" },
    { label: "Case Management", icon: FileText, path: "/cases" },
    { label: "Field Executive", icon: Users, path: "/field-executives" },
    { label: "Case Assign", icon: ClipboardList, path: "/cases/assignments" },
    // { label: "Investigations", icon: BarChart3, path: "/investigations" },
     { label: "Active case", icon: BarChart3, path: "/case" },
  ];

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <aside
        className={`bg-white border-r border-gray-200 text-black flex-shrink-0 transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          sidebarCollapsed ? "w-20" : "w-64"
        } md:translate-x-0 fixed md:sticky top-0 h-screen z-50`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-[75px] p-4 border-b border-gray-200">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <Link
                to="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                onClick={handleLinkClick}
              >
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-lg font-bold">Admin Panel</h1>
                    <p className="text-xs text-gray-500">
                      Insurance Management
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              // Active if current pathname matches link.path
              const active = location.pathname === link.path;

              return (
                <Link
                  to={link.path}
                  key={link.label}
                  onClick={() => {
                    handleLinkClick;
                    setActiveMenu(link.label);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    active
                      ? "bg-black text-white shadow-sm"
                      : "hover:bg-gray-100 text-gray-800"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? link.label : ""}
                  aria-label={link.label}
                  aria-current={active ? "page" : undefined}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              onClick={() => {
                // Add logout logic here
                console.log("Logout clicked");
              }}
              title={sidebarCollapsed ? "Logout" : ""}
              aria-label="User profile and logout"
            >
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">Admin User</p>
                    <p className="text-xs text-gray-500 truncate">
                      admin@example.com
                    </p>
                  </div>
                  <LogOut className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </>
              )}
              {sidebarCollapsed && (
                <span className="sr-only">Admin User - Logout</span>
              )}
            </button>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-2 m-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
