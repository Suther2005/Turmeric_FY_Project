import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanEye,
  CloudSun,
  Layers,
  ArrowRight,
  ChevronRight,
  Sparkles,
  GitMerge,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-agri-900 via-agri-950 to-agri-950 text-white p-8 md:p-14 shadow-card border border-agri-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agri-800/80 border border-agri-600/50 text-agri-300 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Multimodal Crop Intelligence Prototype
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
            Intelligent Turmeric Disease <br />
            <span className="text-emerald-400">Risk Assessment</span>
          </h1>

          <p className="text-base md:text-lg text-agri-100/90 max-w-2xl font-normal leading-relaxed">
            Combining deep learning-based visual analysis with environmental intelligence for smarter crop health monitoring.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => navigate('/disease-detection')}
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-agri-950 font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer"
            >
              <span>START ANALYSIS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm tracking-wide border border-white/20 transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <span>EXPLORE DASHBOARD</span>
              <ChevronRight className="w-4 h-4 text-agri-300" />
            </button>
          </div>
        </div>

        {/* Feature Pillars Banner */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-agri-200">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ScanEye className="w-4 h-4" />
            </div>
            <span>IMAGE AI (Visual Diagnosis)</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-agri-200">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CloudSun className="w-4 h-4" />
            </div>
            <span>Environmental AI (Microclimate Risk)</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-agri-200">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span>Multimodal Fusion (Decision Support)</span>
          </div>
        </div>
      </div>

      {/* 3 Three Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 01 */}
        <div
          onClick={() => navigate('/disease-detection')}
          className="bg-white p-7 rounded-2xl border border-[#e2ece6] shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-agri-800 font-display">01</span>
              <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-800 flex items-center justify-center group-hover:bg-agri-800 group-hover:text-white transition-colors">
                <ScanEye className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-agri-800 transition-colors">
              Visual Disease Detection
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Identify turmeric leaf diseases from visual symptoms using deep learning feature extraction.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-agri-800 group-hover:translate-x-1 transition-transform">
            <span>Explore Visual Pipeline</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Card 02 */}
        <div
          onClick={() => navigate('/environmental-risk')}
          className="bg-white p-7 rounded-2xl border border-[#e2ece6] shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-agri-800 font-display">02</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CloudSun className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-agri-800 transition-colors">
              Environmental Risk Assessment
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Evaluate environmental conditions associated with disease development and pathogen incubation.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-agri-800 group-hover:translate-x-1 transition-transform">
            <span>Evaluate Weather Stress</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Card 03 */}
        <div
          onClick={() => navigate('/multimodal-analysis')}
          className="bg-white p-7 rounded-2xl border border-agri-300 shadow-card hover:shadow-elevated transition-all duration-200 group cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-agri-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Core AI
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-agri-800 font-display">03</span>
              <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center group-hover:bg-agri-800 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-agri-800 transition-colors">
              Multimodal Decision Support
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Combine both information sources to estimate overall disease risk and actionable recommendations.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-agri-800 group-hover:translate-x-1 transition-transform">
            <span>Launch Multimodal Fusion</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>

      {/* Visual Pipeline Diagram Section */}
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#e2ece6] shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-agri-700 uppercase tracking-wider">
              Proposed Research Architecture
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">
              Multimodal Decision-Support Pipeline
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Visual + Environmental Information Fusion
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Stream 1 */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <ScanEye className="w-4 h-4 text-emerald-600" /> Modality A: Visual Symptom Evidence
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between shadow-xs">
                <span>1. Turmeric Leaf Image</span>
                <span className="text-[10px] text-slate-400 font-mono">RGB (224x224)</span>
              </div>
              <div className="flex justify-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between shadow-xs">
                <span>2. Deep Feature Extraction</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">EfficientNet + MobileNet</span>
              </div>
              <div className="flex justify-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-950 flex items-center justify-between shadow-xs">
                <span>3. Disease Class + Confidence</span>
                <span className="text-xs font-mono font-bold text-emerald-700">94.6%</span>
              </div>
            </div>
          </div>

          {/* Stream 2 */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <CloudSun className="w-4 h-4 text-amber-600" /> Modality B: Microclimate Context
            </div>
            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between shadow-xs">
                <span>1. Microclimate Sensor Inputs</span>
                <span className="text-[10px] text-slate-400 font-mono">8 Agronomic Features</span>
              </div>
              <div className="flex justify-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between shadow-xs">
                <span>2. Environmental Risk Modeling</span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono">Pathogen Incubation Rules</span>
              </div>
              <div className="flex justify-center text-slate-400 text-xs">↓</div>
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 flex items-center justify-between shadow-xs">
                <span>3. Environmental Risk Score</span>
                <span className="text-xs font-mono font-bold text-amber-700">71% (High)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Fusion Result Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-agri-900 to-agri-950 text-white shadow-md border border-agri-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Multimodal Decision Fusion Layer
              </div>
              <h4 className="text-lg font-bold text-white font-display">
                Risk-Aware Turmeric Health Assessment &amp; Actionable Guidance
              </h4>
            </div>
          </div>

          <button
            onClick={() => navigate('/multimodal-analysis')}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-agri-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Run Multimodal Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
