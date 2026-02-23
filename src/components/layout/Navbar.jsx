import { Menu, X, Bell, User, Search } from "lucide-react";
import { useState } from "react";

export default function Navbar({ sidebarOpen, setSidebarOpen, activeMenu }) {
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

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md ml-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases, executives..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <button
            className="lg:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User avatar - mobile only */}
          <button
            className="md:hidden w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
