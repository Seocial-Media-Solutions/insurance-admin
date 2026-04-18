import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCases } from "../context/CaseContext";
import {
  FileText,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Activity,
  User,
  Users,
  Building2,
  ShieldCheck,
  Car,
  AlertOctagon,
  ClipboardList,
  PlusCircle,
  UserPlus
} from "lucide-react";

function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { dashboardStats, statsLoading, loadStats } = useCases();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Use the context method to load stats (it handles caching)
    loadStats();

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      to: "/cases",
      icon: FileText,
      title: "Case Management",
      description: "Register and track all insurance claim cases",
      color: "bg-black"
    },
    {
      to: "/case",
      icon: Car,
      title: "Active Cases",
      description: "Detailed OD and Theft case management and editors",
      color: "bg-black"
    },
    {
      to: "/casefirm",
      icon: Building2,
      title: "Case Firms",
      description: "Manage insurance companies and corporate clients",
      color: "bg-black"
    },
    {
      to: "/field-executives",
      icon: Users,
      title: "Field Executives",
      description: "Manage and track field investigation staff",
      color: "bg-black"
    },
    {
      to: "/cases/assignments",
      icon: ClipboardList,
      title: "Assignments",
      description: "Assign and monitor cases to field executives",
      color: "bg-black"
    },
  ];

  // Add Admin specific feature
 
  const primaryStats = [
    { value: dashboardStats.total, label: "Total Cases", icon: TrendingUp, color: "#000000ff", to: "/cases" },
    { value: dashboardStats.odCases, label: "OD Cases", icon: Car, color: "#000000ff", to: "/case" },
    { value: dashboardStats.theftCases, label: "Theft Cases", icon: AlertOctagon, color: "#000000ff", to: "/case" },
    { value: dashboardStats.paid, label: "Paid Cases", icon: CheckCircle, color: "#000000ff", to: "/cases" },
  ];

  const secondaryStats = [
    { value: dashboardStats.caseFirms, label: "Case Firms", icon: Building2, to: "/casefirm" },
    { value: dashboardStats.fieldExecutives, label: "Field Executives", icon: Users, to: "/field-executives" },
    { value: dashboardStats.assignments, label: "Assignments", icon: ClipboardList, to: "/cases/assignments" },
    { value: dashboardStats.pending, label: "Pending Review", icon: Clock, to: "/cases" },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-12"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-black/5 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-black/5 blur-[100px] animate-pulse delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-black/5 blur-[110px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div
          className={`mb-10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}
        >
          

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {primaryStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Link
                  to={stat.to}
                  key={index}
                  className="rounded-[2.5rem] shadow-xl border p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden relative bg-white/60 backdrop-blur-sm"
                  style={{
                    borderColor: "rgba(229, 231, 235, 0.5)",
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 opacity-[0.03] group-hover:opacity-10 group-hover:scale-150 transition-all duration-1000"
                    style={{ color: stat.color }}
                  >
                    <IconComponent size={128} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 bg-black"
                      style={{ boxShadow: `0 10px 20px -5px ${stat.color}44` }}
                    >
                      <IconComponent
                        size={28}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="text-5xl font-black tabular-nums tracking-tighter"
                      style={{ color: "#111827" }}
                    >
                      {statsLoading ? (
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-extrabold text-xl text-gray-900 tracking-tight">{stat.label}</p>
                    <div className="w-8 h-1 bg-gray-100 rounded-full mt-2 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: `${stat.color}44` }}></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Secondary Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {secondaryStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Link
                  to={stat.to}
                  key={index}
                  className="rounded-2xl border border-white/40 p-5 hover:border-blue-400/50 hover:bg-white/80 transition-all duration-300 flex items-center gap-5 shadow-sm hover:shadow-md bg-white/30 backdrop-blur-[2px]"
                >
                  <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors shadow-inner">
                    <IconComponent size={22} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black tabular-nums text-gray-900">
                      {statsLoading ? "•••" : stat.value}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tabular-nums">Quick Actions</h2>
              <p className="text-gray-500 font-bold text-sm">Rapid access to core operations</p>
            </div>
            <div className="h-px flex-grow bg-gray-100 mx-8 opacity-50"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { to: "/cases/addcase", label: "Add New Case", icon: PlusCircle, color: "text-blue-300", bg: "bg-blue-50" },
              { to: "/casefirm", label: "Add Case Firm", icon: Building2, color: "text-purple-300", bg: "bg-purple-50" },
              { to: "/cases/assignments", label: "Assign Task", icon: ClipboardList, color: "text-orange-300", bg: "bg-orange-50" },
              { to: "/field-executives/add", label: "Add Executive", icon: UserPlus, color: "text-green-300", bg: "bg-green-50" },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                state={
                  action.to === "/casefirm" 
                    ? { openAddFirm: true } 
                    : action.to === "/cases/assignments" 
                      ? { activeTab: "assign" } 
                      : undefined
                }
                className="group p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                  <action.icon size={28} strokeWidth={2.5} />
                </div>
                <span className="font-black text-sm tracking-tight text-gray-800 uppercase tabular-nums">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Control Panel */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10 px-2 text-gray-900">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">Management Modules</h2>
              <p className="text-gray-500 font-bold text-sm">Advanced system controllers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.to}
                  className="rounded-[2.5rem] shadow-2xl border border-white/10 p-10 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 group relative overflow-hidden bg-white"
                >
                  <div
                    className={`absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 ${feature.color}`}
                  ></div>
                  
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl ${feature.color} text-white`}
                    >
                      <IconComponent size={28} />
                    </div>
                    <h3 className="text-2xl font-black mb-3 group-hover:text-blue-600 transition-colors tracking-tighter text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mb-8 font-bold text-base leading-relaxed text-gray-400 tracking-tight">
                      {feature.description}
                    </p>
                    <div
                      className="flex items-center font-black text-[10px] tracking-[0.2em] uppercase group-hover:gap-6 transition-all duration-500 text-gray-900"
                    >
                      <span>Explore Module</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-3 transition-transform duration-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

   
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow { animation: bounceSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .delay-700 { animation-delay: 700ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
}

export default Dashboard;
