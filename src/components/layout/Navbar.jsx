import { Menu, X, Bell, User, Search, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalSearch } from "../../context/SearchContext";
import useDebounce from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { confirmToast } from "../Ui/ConfirmToast";

export default function Navbar({ sidebarOpen, setSidebarOpen, activeMenu }) {
  const { user, logout } = useAuth();
  const { globalSearch, setGlobalSearch } = useGlobalSearch();
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const debouncedSearch = useDebounce(localSearch, 500);
  const location = useLocation();

  // Update global search when debounced value changes
  useEffect(() => {
    setGlobalSearch(debouncedSearch);
  }, [debouncedSearch, setGlobalSearch]);

  // Clear search when navigating to a different page
  useEffect(() => {
    setLocalSearch("");
    setGlobalSearch("");
  }, [location.pathname, setGlobalSearch]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-black hover:bg-gray-100 p-2 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Page title */}
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-gray-900 ">{activeMenu}</h2>
          </div>

          {/* Global search bar — desktop */}
          <div className="hidden lg:flex flex-1 max-w-md ml-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search cases, executives..."
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile — opens inline search */}
          <div className="lg:hidden flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search..."
                className="w-36 sm:w-48 pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-100">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-gray-900 truncate max-w-[100px] uppercase">
                {user?.role?.replace("_", " ")}
              </p>
              <p className="text-[10px] text-gray-400 truncate max-w-[100px]">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => {
                confirmToast("Are you sure you want to log out?", async () => {
                  await logout();
                  toast.success("Logged out successfully");
                });
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
