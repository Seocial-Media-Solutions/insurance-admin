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
      pending: filteredCases.filter(c => c.status?.toLowerCase() === 'pending').length,
      paid: filteredCases.filter(c => c.status?.toLowerCase() === 'paid').length,
      rejected: filteredCases.filter(c => c.status?.toLowerCase() === 'rejected').length
    };

    const totalBilled = filteredCases.reduce((sum, c) => sum + (parseFloat(c.feeBillRs) || 0), 0);
    const totalReceived = filteredCases.reduce((sum, c) => sum + (parseFloat(c.feeRec) || 0), 0);
    const pendingAmount = totalBilled - totalReceived;

    const overdueCases = filteredCases.filter(c => {
      if (!c.slaDueDate) return false;
      return new Date(c.slaDueDate) < now && c.status?.toLowerCase() === 'pending';
    }).length;

    const resolvedCases = filteredCases.filter(c => c.status?.toLowerCase() === 'paid' && c.dateOfLoss && c.feeRecDt);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className={`mb-6 sm:mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-tighter">
                  Analytics
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Comprehensive Insights</p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="w-full md:w-auto flex gap-1 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm p-1 border border-white">
              {[
                { label: '7D', value: '7' },
                { label: '30D', value: '30' },
                { label: '90D', value: '90' },
                { label: 'All', value: '999999' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                    timeRange === range.value
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-500 hover:bg-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-[10px] font-black uppercase ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase">Total Billed</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">₹{analytics.totalBilled.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase">Total Received</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">₹{analytics.totalReceived.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase">Pending</h3>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">₹{analytics.pendingAmount.toLocaleString()}</p>
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
