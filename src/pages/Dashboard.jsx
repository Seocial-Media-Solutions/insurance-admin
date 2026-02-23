import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCases } from "../context/useCases";
import {
  FileText,
  BarChart3,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Activity,
  User,
} from "lucide-react";

function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const { cases, loading } = useCases();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const features = [
    {
      to: "/cases",
      icon: FileText,
      title: "Case Management",
      description: "Register, edit, and track all insurance claim cases in one place",
    },
    {
      to: "/analytics",
      icon: BarChart3,
      title: "Analytics",
      description: "View detailed statistics and insights about your cases",
    },
     {
      to: "/field-executives",
      icon: User,
      title: "Field Executive",
      description: "Manage field executives",
    },
     {
      to: "/cases/assignments",
      icon: User,
      title: "Assignments",
      description: "Manage case assignments",
    },
     {
      to: "/investigations",
      icon: User,
      title: "Investigations",
      description: "Manage cases investigations",
    },
  ];

  const totalCases = cases.length;
  const paidCases = cases.filter((c) => c.status?.toLowerCase() === "paid").length;
  const pendingCases = cases.filter((c) => c.status?.toLowerCase() !== "paid").length;
  const rejectedCases = cases.filter((c) => c.status?.toLowerCase() === "rejected").length;

  const stats = [
    { value: totalCases, label: "Total Cases", icon: TrendingUp },
    { value: paidCases, label: "Paid Cases", icon: CheckCircle },
    { value: pendingCases, label: "Pending Cases", icon: Clock },
    { value: rejectedCases, label: "Rejected Cases", icon: XCircle },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <Briefcase className="w-6 h-6" style={{ color: "white" }} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold">{greeting()}!</h1>
              </div>
              <p style={{ color: "var(--secondary)" }}>
                {time.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="rounded-xl shadow-lg px-6 py-3 border"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-2xl font-bold font-mono"
                  style={{ color: "var(--foreground)" }}
                >
                  {time.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Link
                  to="/cases"
                  key={index}
                  className="rounded-xl shadow-lg border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fadeInUp"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent
                      className="w-8 h-8 transition-transform duration-300 group-hover:scale-125"
                      style={{ color: "var(--primary)" }}
                    />
                    <div
                      className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110"
                      style={{ color: "var(--primary)" }}
                    >
                      {loading ? (
                        <div className="w-8 h-8 border-2 border-gray-300 rounded-full animate-spin"></div>
                      ) : (
                        stat.value
                      )}
                    </div>
                  </div>
                  <p style={{ color: "var(--secondary)" }}>{stat.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            ></span>
            Features & Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.to}
                  className="rounded-2xl shadow-xl border p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden animate-fadeInUp"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    animationDelay: `${(index + 4) * 100}ms`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                    style={{ backgroundColor: "var(--primary)" }}
                  ></div>
                  <div className="relative z-10">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: "white" }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p style={{ color: "var(--secondary)" }}>{feature.description}</p>
                    <div
                      className="flex items-center font-semibold group-hover:gap-3 transition-all duration-300"
                      style={{ color: "var(--primary)" }}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Section */}
        <div
          className="rounded-2xl shadow-xl border p-8 hover:shadow-2xl transition-all duration-300"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: "var(--accent)" }}
            ></span>
            Recent Activity
          </h2>
          <div className="text-center py-12">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 animate-bounce-slow"
              style={{ backgroundColor: "var(--border)" }}
            >
              <Activity className="w-12 h-12" style={{ color: "var(--secondary)" }} />
            </div>
            <p style={{ color: "var(--secondary)" }}>No recent activity</p>
            <p style={{ color: "var(--secondary)", opacity: 0.7 }}>
              Your activity will appear here
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out backwards; }
        .delay-animation { animation: pulse 4s ease-in-out infinite; animation-delay: 1s; }
        .animate-bounce-slow { animation: bounceSlow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default Dashboard;
