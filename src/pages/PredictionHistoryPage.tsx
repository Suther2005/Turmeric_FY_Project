import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  FileSpreadsheet,
  Trash2,
  BookmarkCheck,
  ChevronDown,
  Radio,
  Sliders,
} from 'lucide-react';

export const PredictionHistoryPage: React.FC = () => {
  const { language, predictionHistory, openDetailedReport, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const filteredHistory = useMemo(() => {
    return predictionHistory.filter((item) => {
      const matchesSearch =
        item.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDisease = diseaseFilter === 'All' || item.disease === diseaseFilter;
      const matchesRisk =
        riskFilter === 'All' ||
        (riskFilter === 'High' && item.overallRisk >= 68) ||
        (riskFilter === 'Moderate' && item.overallRisk >= 36 && item.overallRisk < 68) ||
        (riskFilter === 'Low' && item.overallRisk < 36);

      return matchesSearch && matchesDisease && matchesRisk;
    });
  }, [predictionHistory, searchTerm, diseaseFilter, riskFilter]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Image,Disease,Confidence,EnvironmentalRisk,OverallRisk,Status']
        .concat(
          filteredHistory.map(
            (r) =>
              `${r.date},${r.imageName},${r.disease},${r.confidence}%,${r.environmentalRisk}%,${r.overallRisk}%,${r.status}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'turmeric_crop_health_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: language === 'ta' ? 'பதிவேடு பதிவிறக்கப்பட்டது' : 'Farm Log Exported',
      message: `${filteredHistory.length} records.`,
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              {language === 'ta' ? 'களப் பதிவேடு' : 'Field Records & Audit Trail'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display mt-0.5">
            {TRANSLATIONS.nav.history[language]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {language === 'ta'
              ? 'உங்கள் பண்ணையில் மேற்கொள்ளப்பட்ட முந்தைய பரிசோதனைகள் மற்றும் பரிந்துரைகளின் பதிவேடு.'
              : 'Historical field diagnostics, leaf pathology scans, and microclimate records.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>{TRANSLATIONS.actions.exportCsv[language]}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#e2ece6] shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ta' ? 'நோய், இலைப்படம் பெயர் மூலம் தேட...' : 'Search by disease, image name, notes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Disease Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'நோய்:' : 'Disease:'}
            </span>
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">{language === 'ta' ? 'அனைத்தும்' : 'All Classes'}</option>
              <option value="Blotch">Blotch (இலைக்கருகல்)</option>
              <option value="Leaf Spot">Leaf Spot (இலைப்புள்ளி)</option>
              <option value="Aphids">Aphids (அசுவினி)</option>
              <option value="Healthy">Healthy (ஆரோக்கியமானது)</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ta' ? 'அபாயம்:' : 'Risk:'}
            </span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">{language === 'ta' ? 'அனைத்தும்' : 'All Risks'}</option>
              <option value="High">{language === 'ta' ? 'அதிக அபாயம்' : 'High'}</option>
              <option value="Moderate">{language === 'ta' ? 'மிதமான அபாயம்' : 'Moderate'}</option>
              <option value="Low">{language === 'ta' ? 'குறைந்த அபாயம்' : 'Low'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-[#e2ece6] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">{language === 'ta' ? 'நாள்' : 'Date'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'இலைப்படம்' : 'Specimen'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'நோய் விபரம்' : 'Disease'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'மாடல் நம்பிக்கை' : 'Model Confidence'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'சூழல் அபாயம்' : 'Env Risk'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'மொத்த அபாயம்' : 'Overall Risk'}</th>
                <th className="py-3.5 px-4">{language === 'ta' ? 'நிலை' : 'Status'}</th>
                <th className="py-3.5 px-5 text-right">{language === 'ta' ? 'விவரம்' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {language === 'ta' ? 'பதிவுகள் எதுவும் இல்லை.' : 'No prediction records matched your query.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-agri-50/40 transition-colors group cursor-pointer"
                    onClick={() => openDetailedReport(record)}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-5 font-semibold text-slate-600 whitespace-nowrap">
                      {record.date}
                    </td>

                    {/* Specimen */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={record.imageUrl}
                            alt={record.disease}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                          {record.imageName}
                        </span>
                      </div>
                    </td>

                    {/* Disease */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-display text-sm">
                      {record.disease}
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {record.confidence}%
                    </td>

                    {/* Environmental Risk */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {record.environmentalRisk}%
                    </td>

                    {/* Overall Risk */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {record.overallRisk}%
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                          record.status === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : record.status === 'Moderate' || record.status === 'Moderate-High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    {/* Details Button */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailedReport(record);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-agri-800 group-hover:text-white text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{TRANSLATIONS.actions.viewDetails[language]}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
