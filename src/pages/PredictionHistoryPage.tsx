import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PredictionHistoryRecord } from '../types';
import { formatLocationDisplay } from '../services/weatherService';
import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  Calendar,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
  Sprout,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const PredictionHistoryPage: React.FC = () => {
  const {
    language,
    predictionHistory,
    openDetailedReport,
    deletePredictionRecord,
    addToast,
    selectedLocation,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter history records
  const filteredHistory = useMemo(() => {
    return predictionHistory.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const locDisplay = typeof item.location === 'string'
        ? item.location
        : (item.location ? formatLocationDisplay(item.location as any, language) : '');
      const matchesSearch =
        !term ||
        (item.disease && item.disease.toLowerCase().includes(term)) ||
        (item.date && item.date.toLowerCase().includes(term)) ||
        (item.time && item.time.toLowerCase().includes(term)) ||
        (locDisplay && locDisplay.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term));

      if (!matchesSearch) return false;
      if (timeFilter === 'All') return true;

      const recordTime = item.timestamp ? new Date(item.timestamp).getTime() : new Date(item.date).getTime();
      if (isNaN(recordTime)) return true;

      const now = Date.now();
      const diffDays = (now - recordTime) / (1000 * 60 * 60 * 24);

      if (timeFilter === '7days') {
        return diffDays <= 7;
      }
      if (timeFilter === '30days') {
        return diffDays <= 30;
      }
      if (timeFilter === 'thisMonth') {
        const recDate = item.timestamp ? new Date(item.timestamp) : new Date(item.date);
        const nowDate = new Date();
        return recDate.getMonth() === nowDate.getMonth() && recDate.getFullYear() === nowDate.getFullYear();
      }

      return true;
    });
  }, [predictionHistory, searchTerm, timeFilter, language]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage));
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Time,Location,Disease,Confidence,Environmental Risk,Combined Risk,Recommendation']
        .concat(
          filteredHistory.map(
            (r) => {
              const locStr = typeof r.location === 'string'
                ? r.location
                : (r.location ? formatLocationDisplay(r.location as any, 'en') : 'Tamil Nadu');
              return `"${r.date}","${r.time || ''}","${locStr.replace(/"/g, '""')}","${r.disease}","${r.confidence}%","${r.environmentalRisk}%","${r.overallRisk}%","${(r.recommendation || r.notes || '').replace(/"/g, '""')}"`;
            }
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'turmeric_crop_history_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: language === 'ta' ? 'பதிவேடு பதிவிறக்கப்பட்டது' : 'Farm Log Exported',
      message: `${filteredHistory.length} records exported to CSV.`,
    });
  };

  // Export PDF (Print dialog formatted for farm report)
  const handleExportPDF = () => {
    window.print();
    addToast({
      type: 'info',
      title: language === 'ta' ? 'PDF அச்சிடு' : 'Export PDF',
      message: language === 'ta' ? 'அறிக்கை தயார் செய்யப்படுகிறது.' : 'Opening print / PDF dialog.',
    });
  };

  return (
    <>
      {/* =========================================================================
          NORMAL SCREEN UI (Unchanged, hidden in print mode)
          ========================================================================= */}
      <div className="space-y-5 max-w-6xl mx-auto pb-12 print:hidden">
        {/* 1. Breadcrumbs */}
      <div className="flex items-center text-xs font-medium text-slate-400 gap-1.5 pt-1">
        <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
          Curuma
        </Link>
        <span>›</span>
        <span>{language === 'ta' ? 'விவசாய சேவைகள்' : 'Farmer Services'}</span>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {language === 'ta' ? 'முந்தைய பதிவுகள்' : 'My History'}
        </span>
      </div>

      {/* 2. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <HistoryIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {language === 'ta' ? 'முந்தைய பதிவுகள்' : 'My History'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium pl-0.5">
            {language === 'ta'
              ? 'உங்கள் முந்தைய இலை பரிசோதனைகள் மற்றும் முடிவுகள்.'
              : 'Your past leaf checks and results.'}
          </p>
        </div>

        {/* Right Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-emerald-200/80 shadow-xs">
          <Sprout className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-left">
            <span className="text-[11px] font-bold text-slate-800 block leading-tight">
              {language === 'ta' ? 'தவறாமல் கண்காணிக்கவும்' : 'Keep checking regularly'}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 block leading-tight">
              {language === 'ta' ? 'ஆரோக்கியமான மஞ்சள் பயிருக்கு' : 'for a healthier turmeric crop.'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Empty State vs Records Table */}
      {predictionHistory.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e2ece6] shadow-card p-10 md:p-14 text-center max-w-2xl mx-auto space-y-5 my-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
            <HistoryIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-display">
              {language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை' : 'No records yet'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              {language === 'ta'
                ? 'உங்கள் முடிவுகளை இங்கே காண உங்கள் முதல் மஞ்சள் இலையை ஆய்வு செய்யுங்கள்.'
                : 'Analyze your first turmeric leaf to see your results here.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/disease-detection"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d4a2d] hover:bg-[#145a38] text-white font-bold text-xs md:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>{language === 'ta' ? 'இலையை சரிபார்' : 'Check Leaf'}</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Action Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-[#e2ece6] shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  language === 'ta'
                    ? 'நாள் அல்லது முடிவை தேட...'
                    : 'Search by date or result...'
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-colors"
              />
            </div>

            {/* Time Dropdown & Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Time Filter Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={timeFilter}
                  onChange={(e) => {
                    setTimeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="All">{language === 'ta' ? 'அனைத்து காலமும்' : 'All Time'}</option>
                  <option value="7days">{language === 'ta' ? 'கடந்த 7 நாட்கள்' : 'Last 7 Days'}</option>
                  <option value="30days">{language === 'ta' ? 'கடந்த 30 நாட்கள்' : 'Last 30 Days'}</option>
                  <option value="thisMonth">{language === 'ta' ? 'இந்த மாதம்' : 'This Month'}</option>
                </select>
              </div>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-red-50/50 text-red-600 font-bold text-xs border border-red-200 shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'ta' ? 'PDF பதிவிறக்கம்' : 'Export PDF'}</span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-2xl bg-white hover:bg-emerald-50/50 text-emerald-700 font-bold text-xs border border-emerald-300 shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ta' ? 'CSV பதிவிறக்கம்' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Records Display: Mobile Cards (<md) & Desktop Table (md+) */}
          <div className="bg-white rounded-3xl border border-[#e2ece6] shadow-card overflow-hidden">
            {/* Mobile Cards View (<md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {language === 'ta' ? 'பொருந்தும் பதிவுகள் எதுவும் இல்லை.' : 'No matching records found.'}
                </div>
              ) : (
                paginatedRecords.map((record) => {
                  const isHealthy = record.disease === 'Healthy';
                  const isHigh = record.status === 'High';
                  const isModerate = record.status === 'Moderate' || record.status === 'Moderate-High';

                  return (
                    <div key={record.id} className="p-4 space-y-3">
                      {/* Top: Date, Time & Risk Badge */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {record.date} • {record.time || '10:00 AM'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isHigh
                              ? 'bg-[#fde8e8] text-[#d32f2f]'
                              : isModerate
                              ? 'bg-[#fef3c7] text-[#b45309]'
                              : 'bg-[#e6f7ec] text-[#15803d]'
                          }`}
                        >
                          {isHigh ? '!' : isModerate ? '▲' : '✓'} {isHigh ? (language === 'ta' ? 'அதிகம்' : 'High') : isModerate ? (language === 'ta' ? 'மிதமானது' : 'Moderate') : (language === 'ta' ? 'குறைவானது' : 'Low')}
                        </span>
                      </div>

                      {/* Middle: Thumbnail + Disease Diagnosis */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={record.imageUrl}
                            alt={record.disease}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-slate-900 font-display text-sm truncate">
                            {record.disease === 'Leaf Spot'
                              ? (language === 'ta' ? 'இலைப்புள்ளி (Leaf Spot)' : 'Leaf Spot')
                              : record.disease === 'Blotch'
                              ? (language === 'ta' ? 'இலைக்கருகல் (Leaf Blotch)' : 'Leaf Blotch')
                              : record.disease === 'Aphids'
                              ? (language === 'ta' ? 'அசுவினி (Aphids)' : 'Aphids')
                              : (language === 'ta' ? 'ஆரோக்கியமானது (Healthy)' : 'Healthy')}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {typeof record.location === 'string'
                              ? record.location
                              : record.location
                              ? formatLocationDisplay(record.location as any, language)
                              : 'Tamil Nadu'}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {isHealthy
                              ? (language === 'ta' ? 'நோய் அறிகுறி இல்லை' : 'No disease detected')
                              : (language === 'ta' ? 'நோய் கண்டறியப்பட்டது' : 'Disease detected')}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions: Full-Width Mobile Tap Targets (44px min height) */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => openDetailedReport(record)}
                          className="py-2.5 px-3 rounded-xl bg-[#e6f7ec] hover:bg-[#dcfce7] text-[#166534] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                        >
                          <Eye className="w-4 h-4 text-[#166534]" />
                          <span>{language === 'ta' ? 'விவரம்' : 'View Details'}</span>
                        </button>
                        <button
                          onClick={() => deletePredictionRecord(record.id)}
                          className="py-2.5 px-3 rounded-xl bg-[#fee2e2] hover:bg-[#fecaca] text-[#991b1b] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                        >
                          <Trash2 className="w-4 h-4 text-[#991b1b]" />
                          <span>{language === 'ta' ? 'நீக்கு' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#eef8f1] border-b border-[#e2ece6] text-slate-800 font-bold text-xs">
                    <th className="py-4 px-6">{language === 'ta' ? 'நாள் & நேரம்' : 'Date & Time'}</th>
                    <th className="py-4 px-4">{language === 'ta' ? 'இலைப்படம்' : 'Leaf Photo'}</th>
                    <th className="py-4 px-6">{language === 'ta' ? 'முடிவு' : 'Result'}</th>
                    <th className="py-4 px-6">{language === 'ta' ? 'அபாய நிலை' : 'Risk'}</th>
                    <th className="py-4 px-6 text-right">{language === 'ta' ? 'செயல்' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center text-slate-400">
                        {language === 'ta' ? 'பொருந்தும் பதிவுகள் எதுவும் இல்லை.' : 'No matching records found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => {
                      const isHealthy = record.disease === 'Healthy';
                      const isHigh = record.status === 'High';
                      const isModerate = record.status === 'Moderate' || record.status === 'Moderate-High';

                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Date & Time */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-xs md:text-sm">
                              {record.date}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {record.time || '10:00 AM'}
                            </div>
                          </td>

                          {/* Leaf Specimen Image */}
                          <td className="py-4 px-4">
                            <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                              <img
                                src={record.imageUrl}
                                alt={record.disease}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          </td>

                          {/* Disease Result */}
                          <td className="py-4 px-6">
                            <div className="font-extrabold text-slate-900 font-display text-sm">
                              {record.disease === 'Leaf Spot'
                                ? (language === 'ta' ? 'இலைப்புள்ளி (Leaf Spot)' : 'Leaf Spot')
                                : record.disease === 'Blotch'
                                ? (language === 'ta' ? 'இலைக்கருகல் (Leaf Blotch)' : 'Leaf Blotch')
                                : record.disease === 'Aphids'
                                ? (language === 'ta' ? 'அசுவினி (Aphids)' : 'Aphids')
                                : (language === 'ta' ? 'ஆரோக்கியமானது (Healthy)' : 'Healthy')}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {isHealthy
                                ? (language === 'ta' ? 'நோய் அறிகுறி இல்லை' : 'No disease detected')
                                : (language === 'ta' ? 'நோய் கண்டறியப்பட்டது' : 'Disease detected')}
                            </div>
                          </td>

                          {/* Risk Badge */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold ${
                                isHigh
                                  ? 'bg-[#fde8e8] text-[#d32f2f]'
                                  : isModerate
                                  ? 'bg-[#fef3c7] text-[#b45309]'
                                  : 'bg-[#e6f7ec] text-[#15803d]'
                              }`}
                            >
                              {isHigh ? (
                                <span className="w-3.5 h-3.5 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-[9px] font-black">
                                  !
                                </span>
                              ) : isModerate ? (
                                <AlertTriangle className="w-3 h-3 text-[#b45309]" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full bg-[#15803d] text-white flex items-center justify-center text-[9px] font-black">
                                  ✓
                                </span>
                              )}
                              <span>
                                {isHigh
                                  ? (language === 'ta' ? 'அதிகம்' : 'High')
                                  : isModerate
                                  ? (language === 'ta' ? 'மிதமானது' : 'Moderate')
                                  : (language === 'ta' ? 'குறைவானது' : 'Low')}
                              </span>
                            </span>
                          </td>

                          {/* Actions: View & Delete Buttons */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openDetailedReport(record)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#e6f7ec] hover:bg-[#dcfce7] text-[#166534] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs min-h-[36px]"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#166534]" />
                                <span>{language === 'ta' ? 'பார்க்க' : 'View'}</span>
                              </button>

                              <button
                                onClick={() => deletePredictionRecord(record.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#fee2e2] hover:bg-[#fecaca] text-[#991b1b] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs min-h-[36px]"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#991b1b]" />
                                <span>{language === 'ta' ? 'நீக்கு' : 'Delete'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer & Pagination */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                {language === 'ta'
                  ? `${filteredHistory.length} பதிவுகளில் ${paginatedRecords.length} காட்டப்படுகிறது`
                  : `Showing ${paginatedRecords.length} of ${filteredHistory.length} records`}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#0d4a2d] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 6. Bottom Ribbon */}
      <div className="p-3.5 rounded-2xl bg-[#e6f7ec] border border-[#c4ebd1] text-center">
        <span className="text-xs font-bold text-[#1b8a43] flex items-center justify-center gap-2">
          <Sprout className="w-4 h-4 text-[#1b8a43]" />
          <span>
            {language === 'ta'
              ? 'ஆரோக்கியமான பயிர்கள் • சிறந்த மகசூல் • வளமான எதிர்காலம்'
              : 'Healthy Plants • Better Yields • A Prosperous Tomorrow'}
          </span>
        </span>
      </div>
    </div>

      {/* =========================================================================
          DEDICATED PRINT / PDF EXPORT REPORT LAYOUT (A4 Landscape Multi-Page)
          Renders dynamically for ALL records in the active filtered dataset
          ========================================================================= */}
      <div className="hidden print:block w-full text-slate-900 font-sans text-xs">
        {/* 1. Official Report Header */}
        <div className="curuma-print-header pb-4 mb-4 border-b-2 border-emerald-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Curuma AI
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                  Crop Intelligence & Diagnostic Report
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                {language === 'ta'
                  ? 'மஞ்சள் பயிர் நோய் கண்டறிதல் மற்றும் பண்ணை கள கண்காணிப்பு பதிவேடு'
                  : 'Turmeric Crop Health Surveillance & Historical Farm Diagnostic Log'}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] space-y-0.5">
            <div className="font-bold text-slate-900">
              <span className="text-slate-500 font-normal">Location / இடம்: </span>
              {formatLocationDisplay(selectedLocation, language)}
            </div>
            <div className="text-slate-600">
              <span className="text-slate-500">Scope: </span>
              <span className="font-semibold text-slate-800">
                {timeFilter === 'All'
                  ? (language === 'ta' ? 'அனைத்து பதிவுகள்' : 'All Time Records')
                  : timeFilter === '7days'
                  ? (language === 'ta' ? 'கடந்த 7 நாட்கள்' : 'Last 7 Days')
                  : timeFilter === '30days'
                  ? (language === 'ta' ? 'கடந்த 30 நாட்கள்' : 'Last 30 Days')
                  : (language === 'ta' ? 'இந்த மாதம்' : 'Current Month')}
              </span>
              {searchTerm && <span className="text-slate-500"> • Filter: "{searchTerm}"</span>}
            </div>
            <div className="text-slate-600">
              <span className="text-slate-500">Generated: </span>
              <span className="font-semibold text-slate-800">
                {new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Executive Summary / Statistics Bar */}
        <div className="curuma-print-avoid-break grid grid-cols-4 gap-3 mb-4">
          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Records Included</div>
            <div className="text-base font-black text-slate-900">{filteredHistory.length} Scans</div>
          </div>
          <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/50 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Healthy Samples</div>
            <div className="text-base font-black text-emerald-700">
              {filteredHistory.filter((r) => r.disease === 'Healthy').length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/50 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-800">Diseases Identified</div>
            <div className="text-base font-black text-amber-700">
              {filteredHistory.filter((r) => r.disease !== 'Healthy').length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg border border-red-300 bg-red-50/50 text-center">
            <div className="text-[10px] uppercase font-bold text-red-800">High Risk Alerts</div>
            <div className="text-base font-black text-red-700">
              {filteredHistory.filter((r) => r.status === 'High' || (r.overallRisk && r.overallRisk >= 70)).length}
            </div>
          </div>
        </div>

        {/* 3. Dedicated Print Table (Outputs ALL filtered records across pages) */}
        <table className="curuma-print-table w-full border border-slate-300 text-left">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300 text-[10px] font-extrabold text-slate-800 uppercase tracking-wide">
              <th className="py-2 px-2 w-[4%] text-center border-r border-slate-300">#</th>
              <th className="py-2 px-2.5 w-[13%] border-r border-slate-300">Date & Time</th>
              <th className="py-2 px-2.5 w-[14%] border-r border-slate-300">Location</th>
              <th className="py-2 px-2 w-[11%] text-center border-r border-slate-300">Specimen</th>
              <th className="py-2 px-2.5 w-[16%] border-r border-slate-300">AI Diagnosis</th>
              <th className="py-2 px-2 w-[8%] text-center border-r border-slate-300">Confidence</th>
              <th className="py-2 px-2 w-[9%] text-center border-r border-slate-300">Incubation</th>
              <th className="py-2 px-2 w-[11%] text-center border-r border-slate-300">Crop Risk</th>
              <th className="py-2 px-2.5 w-[14%]">Advisory Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-medium text-xs">
                  {language === 'ta'
                    ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டியில் பதிவுகள் எதுவும் இல்லை.'
                    : 'No records found matching the selected report criteria.'}
                </td>
              </tr>
            ) : (
              filteredHistory.map((record, idx) => {
                const isHealthy = record.disease === 'Healthy';
                const isHigh = record.status === 'High' || (record.overallRisk && record.overallRisk >= 70);
                const isMod = !isHigh && (record.status === 'Moderate' || record.status === 'Moderate-High' || (record.overallRisk && record.overallRisk >= 35));

                return (
                  <tr
                    key={record.id || idx}
                    className="curuma-print-avoid-break text-[10px] leading-snug border-b border-slate-200"
                  >
                    <td className="py-2 px-2 text-center font-bold text-slate-600 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{record.date}</div>
                      <div className="text-slate-500 text-[9px]">{record.time || '10:00 AM'}</div>
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <div className="font-medium text-slate-800 line-clamp-2">
                        {typeof record.location === 'string'
                          ? record.location
                          : record.location
                          ? formatLocationDisplay(record.location as any, language)
                          : 'Tamil Nadu'}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">
                      <div className="w-12 h-9 mx-auto rounded overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                        {record.imageUrl ? (
                          <img
                            src={record.imageUrl}
                            alt={record.disease}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] text-slate-400">No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-[10.5px]">
                        {record.disease === 'Leaf Spot'
                          ? (language === 'ta' ? 'இலைப்புள்ளி (Leaf Spot)' : 'Leaf Spot')
                          : record.disease === 'Blotch'
                          ? (language === 'ta' ? 'இலைக்கருகல் (Leaf Blotch)' : 'Leaf Blotch')
                          : record.disease === 'Aphids'
                          ? (language === 'ta' ? 'அசுவினி (Aphids)' : 'Aphids')
                          : (language === 'ta' ? 'ஆரோக்கியமானது (Healthy)' : 'Healthy')}
                      </div>
                      <div className={`text-[9px] font-semibold ${isHealthy ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {isHealthy
                          ? (language === 'ta' ? 'நோய் அறிகுறி இல்லை' : 'Normal foliage')
                          : (language === 'ta' ? 'நோய் கண்டறியப்பட்டது' : 'Pathogen detected')}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-800 border-r border-slate-200">
                      {record.confidence ? `${record.confidence}%` : 'N/A'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200">
                      <span className="font-semibold text-slate-700">
                        {record.environmentalRisk !== undefined ? `${record.environmentalRisk}%` : '—'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-200">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          isHigh
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : isMod
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isHigh ? 'High Risk' : isMod ? 'Moderate' : 'Low Risk'}
                        {record.overallRisk !== undefined ? ` (${record.overallRisk}/100)` : ''}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 text-[9px]">
                      <p className="line-clamp-2">
                        {record.recommendation || record.notes || (isHealthy ? 'Maintain balanced irrigation & micronutrient regime.' : 'Apply recommended bio-control agent or copper oxychloride as per advisory.')}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 4. Official Print Footer / Sign-off */}
        <div className="curuma-print-avoid-break mt-6 pt-4 border-t border-slate-300 flex items-end justify-between text-[9px] text-slate-500">
          <div className="max-w-xl space-y-0.5">
            <div className="font-bold text-slate-700">Curuma Multimodal Crop Diagnostic & Environmental Surveillance Engine</div>
            <div>Automated crop intelligence log combining Dual Deep CNN classification (MobileNetV2 + EfficientNet-B0) with Open-Meteo 14-day reanalysis environmental incubation modeling.</div>
            <div className="italic">Scientific decision support only. Confirm field chemical interventions with local TNAU / KVK agricultural extension specialists.</div>
          </div>
          <div className="text-right space-y-4">
            <div className="w-48 border-b border-slate-400"></div>
            <div className="font-bold text-slate-700">Field Inspector / Agricultural Officer</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictionHistoryPage;
