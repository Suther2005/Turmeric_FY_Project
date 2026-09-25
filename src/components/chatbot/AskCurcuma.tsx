import React, { useState } from 'react';
import { ChatLauncher } from './ChatLauncher';
import { ChatPanel } from './ChatPanel';
import { useApp } from '../../context/AppContext';
import { ChatAppContext } from './types';

export const AskCurcuma: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localLangOverride, setLocalLangOverride] = useState<'en' | 'ta' | null>(null);

  // Safely consume values from AppContext
  let contextLanguage: 'en' | 'ta' = 'en';
  let chatAppContext: ChatAppContext = {
    hasAnalyzedImage: false,
    historyCount: 0,
  };

  try {
    const appContext = useApp();
    if (appContext) {
      if (appContext.language) {
        contextLanguage = appContext.language;
      }
      chatAppContext = {
        hasAnalyzedImage: appContext.hasAnalyzedImage,
        imageResult: appContext.imageResult
          ? {
              disease: appContext.imageResult.disease,
              confidence: appContext.imageResult.confidence,
              oodStatus: appContext.imageResult.oodStatus,
              status: appContext.imageResult.status,
              modelMode: appContext.imageResult.modelMode,
              verifierStatus: appContext.imageResult.verificationStatus,
            }
          : undefined,
        envParameters: appContext.envParameters,
        envRiskResult: appContext.envRiskResult
          ? {
              overallRiskScore: appContext.envRiskResult.overallRiskScore,
              riskLevel: appContext.envRiskResult.riskLevel,
              dominantRiskFactor: appContext.envRiskResult.dominantRiskFactor,
            }
          : undefined,
        selectedLocation: appContext.selectedLocation
          ? {
              name: appContext.selectedLocation.name,
              district: appContext.selectedLocation.district,
            }
          : undefined,
        historyCount: appContext.predictionHistory ? appContext.predictionHistory.length : 0,
        sensorConnected: appContext.sensorStatus?.isConnected,
      };
    }
  } catch {
    // Graceful fallback if rendered outside AppProvider
    contextLanguage = 'en';
  }

  const effectiveLanguage = localLangOverride || contextLanguage;

  const handleToggleLanguage = (lang: 'en' | 'ta') => {
    setLocalLangOverride(lang);
  };

  return (
    <div className="curcuma-chatbot-isolated print:hidden">
      {/* Floating Chat Panel */}
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        language={effectiveLanguage}
        onToggleLanguage={handleToggleLanguage}
        appContext={chatAppContext}
      />

      {/* Floating Launcher Button */}
      <ChatLauncher
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        language={effectiveLanguage}
      />
    </div>
  );
};

export default AskCurcuma;
