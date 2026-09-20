import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { EnvironmentalRiskPage } from './pages/EnvironmentalRiskPage';
import { MultimodalAnalysisPage } from './pages/MultimodalAnalysisPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/disease-detection" element={<DiseaseDetectionPage />} />
            <Route path="/environmental-risk" element={<EnvironmentalRiskPage />} />
            <Route path="/multimodal-analysis" element={<MultimodalAnalysisPage />} />
            <Route path="/history" element={<PredictionHistoryPage />} />
            <Route path="/model-comparison" element={<ModelComparisonPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
