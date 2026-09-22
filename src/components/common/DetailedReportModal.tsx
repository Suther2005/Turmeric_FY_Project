import React from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/translations';
import { RiskGauge } from './RiskGauge';
import {
  X,
  Printer,
  Share2,
  FileCheck2,
  Thermometer,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const DetailedReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, activeReportRecord, addToast, language } = useApp();

  if (!isReportModalOpen || !activeReportRecord) return null;

  const t = TRANSLATIONS.reportModal;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `TurmeriCare AI Report - ${activeReportRecord.disease} (${activeReportRecord.confidence}%)\nOverall Risk: ${activeReportRecord.overallRisk}% (${activeReportRecord.status})\nDate: ${activeReportRecord.date}`
    );
    addToast({
      type: 'success',
      title: language === 'ta' ? 'அறிக்கை நகலெடுக்கப்பட்டது' : 'Report Copied',
      message: language === 'ta' ? 'அறிக்கை விவரங்கள் நகலெடுக்கப்பட்டது.' : 'Summary diagnostics copied to clipboard.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-agri-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-display">
                {t.title[language]}
              </h3>
              <p className="text-xs text-agri-200 flex items-center gap-2 flex-wrap">
                <span>{t.recordId[language]} {activeReportRecord.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {activeReportRecord.date} {activeReportRecord.time ? `• ${activeReportRecord.time}` : ''}
                </span>
                {activeReportRecord.location && (
                  <>
                    <span>•</span>
                    <span>📍 {activeReportRecord.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopySummary}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Copy Summary"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-500 text-white transition-colors ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-agri-50/60 p-5 rounded-2xl border border-agri-100">
            {/* Risk Gauge */}
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-agri-200/70 pb-4 md:pb-0 md:pr-4">
              <RiskGauge
                score={activeReportRecord.overallRisk}
                size={140}
                strokeWidth={12}
                showLabel={false}
                subtitle={t.multimodalRisk[language]}
              />
            </div>

            {/* Diagnostic Metrics */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.primaryClass[language]}
              </span>
              <div>
                <div className="text-2xl font-extrabold text-agri-950 font-display">
                  {activeReportRecord.disease}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.imageConfidence[language]} {activeReportRecord.confidence}%
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{t.envRiskLabel[language]} </span>
                <span className="font-bold text-agri-800">{activeReportRecord.environmentalRisk}%</span>
              </div>
            </div>

            {/* Sample Image Preview */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-start mb-1.5">
                {t.specimen[language]}
              </span>
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
                <img
                  src={activeReportRecord.imageUrl}
                  alt={activeReportRecord.disease}
                  className="w-full h-full object-contain bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Probabilities Breakdown if available */}
          {activeReportRecord.probabilities && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === 'ta' ? 'கணிப்பு நிகழ்தகவுகள்' : 'Prediction Probabilities (All Classes)'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <div className="text-slate-500 font-medium">Leaf Spot</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {(activeReportRecord.probabilities['Leaf Spot'] ?? activeReportRecord.probabilities.LeafSpot ?? activeReportRecord.probabilities.leafSpot ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <div className="text-slate-500 font-medium">Leaf Blotch</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {(activeReportRecord.probabilities.Blotch ?? activeReportRecord.probabilities['Leaf Blotch'] ?? activeReportRecord.probabilities.leafBlotch ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <div className="text-slate-500 font-medium">Aphids</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {(activeReportRecord.probabilities.Aphids ?? activeReportRecord.probabilities.aphids ?? 0).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <div className="text-slate-500 font-medium">Healthy</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {(activeReportRecord.probabilities.Healthy ?? activeReportRecord.probabilities.healthy ?? 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Context Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-agri-600" /> {t.microclimateTitle[language]}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">{TRANSLATIONS.env.temperature[language]}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {activeReportRecord.parameters.temperature}°C
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">{TRANSLATIONS.env.humidity[language]}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {activeReportRecord.parameters.humidity}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">{TRANSLATIONS.status.dewProxy[language]}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {activeReportRecord.parameters.leafWetness}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">{TRANSLATIONS.env.rainfall[language]}</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">
                  {activeReportRecord.parameters.rainfall} mm
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision Support & Action Plan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> {t.actionPlanTitle[language]}
            </h4>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800">
              <p className="text-sm font-semibold text-amber-950 leading-relaxed">
                {activeReportRecord.notes ||
                  (language === 'ta'
                    ? 'சுற்றுச்சூழல் அளவீடுகள் நோய் பரவலுக்கு சாதகமான சூழலைக் குறிக்கின்றன. பாதிக்கப்பட்ட செடிகளை தொடர்ந்து கண்காணித்து உரிய பாதுகாப்பு பணிகளை மேற்கொள்ளவும்.'
                    : 'Environmental conditions indicate elevated disease risk. Continue monitoring affected plants and follow appropriate crop disease-management practices.')}
              </p>
              <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  <span>{t.inspectionFreq[language]} <strong>{t.every48h[language]}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  <span>{t.targetedTreatment[language]} <strong>{t.treatmentVal[language]}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {TRANSLATIONS.footer.text[language]}
          </span>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {TRANSLATIONS.actions.closeReport[language]}
          </button>
        </div>
      </div>
    </div>
  );
};
