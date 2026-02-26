import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Home, FileText, Users, ClipboardList, BarChart3 } from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import App from "../../App";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  const location = useLocation();

  // 🔗 Define all your navigation links
  const navLinks = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "CaseFirm", icon: Home, path: "/casefirm" },
    { label: "Case Management", icon: FileText, path: "/cases" },
    { label: "Field Executive", icon: Users, path: "/field-executives" },
    { label: "Case Assign", icon: ClipboardList, path: "/cases/assignments" },
    // { label: "Investigations", icon: BarChart3, path: "/investigations" },
    { label: "Active case", icon: BarChart3, path: "/case" },
  ];

  // 🎯 Automatically set active menu based on the route (longest path match first)
  useEffect(() => {
    const sorted = [...navLinks].sort((a, b) => b.path.length - a.path.length);
    const current = sorted.find(
      (link) =>
        location.pathname === link.path ||
        location.pathname.startsWith(link.path + "/")
    );
    setActiveMenu(current ? current.label : "");
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        navLinks={navLinks} // 👈 pass navLinks to sidebar
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeMenu={activeMenu}
        />

        {/* Page content */}
        <main className=" max-w-full flex-1 overflow-auto p-6">
          <App />
        </main>
      </div>
    </div>
  );
}
