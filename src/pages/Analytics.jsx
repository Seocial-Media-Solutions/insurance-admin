import React, { useState, useMemo } from 'react';
import { useCases } from '../context/useCases';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  FileText
} from 'lucide-react';

function Analytics() {
  const { cases, loading } = useCases();
  const [timeRange, setTimeRange] = useState('30'); // days
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const analytics = useMemo(() => {
    if (!cases.length) return null;

    const now = new Date();
    const rangeDate = new Date();
    rangeDate.setDate(rangeDate.getDate() - parseInt(timeRange));

    const filteredCases = cases.filter(c => {
      const caseDate = new Date(c.dtOfCaseRec || c.createdAt);
      return caseDate >= rangeDate;
    });

    const statusCounts = {
      pending: cases.filter(c => c.status?.toLowerCase() === 'pending').length,
      paid: cases.filter(c => c.status?.toLowerCase() === 'paid').length,
      rejected: cases.filter(c => c.status?.toLowerCase() === 'rejected').length
    };

    const totalBilled = cases.reduce((sum, c) => sum + (parseFloat(c.feeBillRs) || 0), 0);
    const totalReceived = cases.reduce((sum, c) => sum + (parseFloat(c.feeRec) || 0), 0);
    const pendingAmount = totalBilled - totalReceived;

    const overdueCases = cases.filter(c => {
      if (!c.slaDueDate) return false;
      return new Date(c.slaDueDate) < now && c.status?.toLowerCase() === 'pending';
    }).length;

    const resolvedCases = cases.filter(c => c.status?.toLowerCase() === 'paid' && c.dateOfLoss && c.feeRecDt);
    const avgResolutionDays = resolvedCases.length > 0
      ? Math.round(resolvedCases.reduce((sum, c) => {
          const start = new Date(c.dateOfLoss);
          const end = new Date(c.feeRecDt);
          return sum + Math.abs(end - start) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedCases.length)
      : 0;

    const collectionRate = totalBilled > 0 ? ((totalReceived / totalBilled) * 100).toFixed(1) : 0;

    return {
      statusCounts,
      totalBilled,
      totalReceived,
      pendingAmount,
      overdueCases,
      avgResolutionDays,
      collectionRate,
      totalCases: cases.length
    };
  }, [cases, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No data available</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Cases',
      value: analytics.totalCases,
      icon: FileText,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Collection Rate',
      value: `${analytics.collectionRate}%`,
      icon: TrendingUp,
      color: 'green',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Avg Resolution',
      value: `${analytics.avgResolutionDays}d`,
      icon: Clock,
      color: 'purple',
      change: '-3d',
      trend: 'up'
    },
    {
      title: 'Overdue Cases',
      value: analytics.overdueCases,
      icon: AlertCircle,
      color: 'red',
      change: analytics.overdueCases > 0 ? '-2' : '0',
      trend: analytics.overdueCases > 0 ? 'down' : 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-gray-600 ml-15">Comprehensive insights and statistics</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2 bg-white rounded-xl shadow-lg p-1">
              {[
                { label: '7D', value: '7' },
                { label: '30D', value: '30' },
                { label: '90D', value: '90' },
                { label: 'All', value: '999999' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Billed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{analytics.totalBilled.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Received</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{analytics.totalReceived.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Amount</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{analytics.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}

export default Analytics;
