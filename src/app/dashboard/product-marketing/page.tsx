"use client";

import { useState } from "react";
import { Check } from "lucide-react";

// Types
import { Step, Mode, Module, Industry, SellingPoint, CampaignData, ProductInfo } from "./types/product-marketing";

// Components
import StepIndicator from "./components/steps/StepIndicator";
import Step1_URLInput from "./components/steps/Step1_URLInput";
import Step2_Analysis from "./components/steps/Step2_Analysis";
import Step3_SellingPoints from "./components/steps/Step3_SellingPoints";
import Step4_Optimization from "./components/steps/Step4_Optimization";
import Step5_CampaignStructure from "./components/steps/Step5_CampaignStructure";
import Step6_CreativeContent from "./components/steps/Step6_CreativeContent";
import Step7_PerformanceUpload from "./components/steps/Step7_PerformanceUpload";
import ModeSelector from "./components/ModeSelector";
import ModuleCards from "./components/ModuleCards";
import IndustryToggle from "./components/IndustryToggle";

// Templates
import { ECOMMERCE_TEMPLATE } from "./templates/ecommerce";
import { RESTAURANT_TEMPLATE } from "./templates/restaurant";

// ============ MAIN COMPONENT ============

export default function ProductMarketingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [mode, setMode] = useState<Mode>("wizard");
  const [module, setModule] = useState<Module | null>(null);
  const [industry, setIndustry] = useState<Industry>("ecommerce");
  
  // Template-based state
  const currentTemplate = industry === "ecommerce" ? ECOMMERCE_TEMPLATE : RESTAURANT_TEMPLATE;
  const [sellingPoints, setSellingPoints] = useState<SellingPoint[]>(currentTemplate.sellingPoints);
  const [product, setProduct] = useState<ProductInfo>(currentTemplate.mockProduct);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [_workspaceId] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState(false);

  // Switch industry template
  const handleIndustryChange = (newIndustry: Industry) => {
    setIndustry(newIndustry);
    const template = newIndustry === "ecommerce" ? ECOMMERCE_TEMPLATE : RESTAURANT_TEMPLATE;
    setSellingPoints(template.sellingPoints);
    setProduct(template.mockProduct);
  };

  // Wizard navigation
  const handleNext = () => {
    if (currentStep < 7) setCurrentStep((currentStep + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const handleComplete = () => setCompleted(true);

  // Quick mode module selection -> jump to step
  const handleModuleSelect = (selectedModule: Module) => {
    setModule(selectedModule);
    switch (selectedModule) {
      case "analysis":
        setCurrentStep(2);
        break;
      case "campaign":
        setCurrentStep(5);
        break;
      case "performance":
        setCurrentStep(7);
        break;
    }
  };

  // Completion screen
  if (completed) {
    return (
      <div className="min-h-screen">
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl lg:text-6xl mb-6">🎉</div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">Marketing Plan 完成！</h1>
          <p className="text-slate-400 mb-8">你的產品營銷計劃已生成完畢</p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-3 text-left">
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-400" /><span className="text-slate-300">產品分析報告</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-400" /><span className="text-slate-300">{sellingPoints.filter(p => p.confirmed).length} 個核心賣點</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-400" /><span className="text-slate-300">廣告結構: {campaign?.adSets.length || 0} Ad Sets</span></div>
            <div className="flex items-center gap-3"><Check className="w-5 h-5 text-green-400" /><span className="text-slate-300">創意內容已生成</span></div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => window.location.href = "/dashboard"} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
              返回 Dashboard
            </button>
            <button onClick={() => window.location.href = "/dashboard/product-marketing"} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition">
              開始新項目
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ WIZARD MODE ============
  if (mode === "wizard") {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Product Marketing Intelligence</h1>
            <p className="text-slate-400 text-sm lg:text-base">從 URL 分析到完整廣告計劃 + 成效追蹤</p>
          </div>
          <div className="flex items-center gap-3">
            <IndustryToggle industry={industry} onChange={handleIndustryChange} />
            <ModeSelector mode={mode} onChange={setMode} />
          </div>
        </div>

        <StepIndicator current={currentStep} total={7} />

        <div className="mt-8">
          {currentStep === 1 && <Step1_URLInput onNext={(u) => { console.log(u); handleNext(); }} />}
          {currentStep === 2 && <Step2_Analysis product={product} onNext={handleNext} onBack={handleBack} />}
          {currentStep === 3 && <Step3_SellingPoints initialPoints={sellingPoints} onNext={(points) => { setSellingPoints(points); handleNext(); }} onBack={handleBack} />}
          {currentStep === 4 && <Step4_Optimization onNext={handleNext} onBack={handleBack} />}
          {currentStep === 5 && <Step5_CampaignStructure sellingPoints={sellingPoints} product={product} onNext={(c) => { setCampaign(c); handleNext(); }} onBack={handleBack} />}
          {currentStep === 6 && campaign && <Step6_CreativeContent campaign={campaign} onNext={handleNext} onBack={handleBack} />}
          {currentStep === 7 && <Step7_PerformanceUpload workspaceId={_workspaceId} onBack={handleBack} onComplete={handleComplete} />}
        </div>
      </div>
    );
  }

  // ============ QUICK MODE ============
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Product Marketing - 快速模式</h1>
          <p className="text-slate-400 text-sm lg:text-base">直接選擇你想使用的功能模組</p>
        </div>
        <div className="flex items-center gap-3">
          <IndustryToggle industry={industry} onChange={handleIndustryChange} />
          <ModeSelector mode={mode} onChange={setMode} />
        </div>
      </div>

      {/* Product Info Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
          {currentTemplate.icon}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{product.name}</div>
          <div className="text-slate-400 text-sm">{product.price} - {currentTemplate.name}</div>
        </div>
        <div className="text-slate-500 text-xs">
          {sellingPoints.filter(p => p.confirmed).length} 個已確認賣點
        </div>
      </div>

      {/* Module Cards */}
      <div className="mb-6">
        <h2 className="text-white font-medium mb-4">選擇功能模組</h2>
        <ModuleCards selected={module} onChange={handleModuleSelect} />
      </div>

      {/* Step Content for Selected Module */}
      {module && (
        <div className="mt-8">
          {module === "analysis" && <Step2_Analysis product={product} onNext={handleNext} onBack={handleBack} />}
          {module === "campaign" && <Step5_CampaignStructure sellingPoints={sellingPoints} product={product} onNext={(c) => { setCampaign(c); handleNext(); }} onBack={handleBack} />}
          {module === "performance" && <Step7_PerformanceUpload workspaceId={_workspaceId} onBack={handleBack} onComplete={handleComplete} />}
        </div>
      )}

      {/* Quick Jump Back */}
      {module && (
        <div className="text-center mt-6">
          <button
            onClick={() => { setModule(null); setMode("wizard"); }}
            className="px-6 py-3 border border-slate-700 text-slate-400 rounded-lg hover:border-slate-600 transition"
          >
            返回向導模式
          </button>
        </div>
      )}
    </div>
  );
}
