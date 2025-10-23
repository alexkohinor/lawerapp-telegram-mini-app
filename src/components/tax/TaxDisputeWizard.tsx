'use client';

import React, { useState } from 'react';
import { TaxTypeStep } from './wizard/TaxTypeStep';
import { VehicleInfoStep } from './wizard/VehicleInfoStep';
import { TaxRequirementStep } from './wizard/TaxRequirementStep';
import { CalculationStep } from './wizard/CalculationStep';
import { DocumentGenerationStep } from './wizard/DocumentGenerationStep';

type WizardStep = 'tax-type' | 'vehicle-info' | 'requirement' | 'calculation' | 'documents';

interface TaxDisputeData {
  // Tax Type
  taxType: string;
  taxPeriod: string;
  region: string;

  // Vehicle Info (for transport tax)
  vehicleType?: string;
  enginePower?: number;
  vehicleBrand?: string;
  vehicleModel?: string;
  registrationNumber?: string;

  // Tax Requirement
  inspectionNumber?: string;
  inspectionName?: string;
  requirementNumber?: string;
  requirementDate?: string;
  claimedAmount?: number;

  // User Info
  taxpayerName?: string;
  taxpayerINN?: string;
  taxpayerAddress?: string;
  taxpayerPhone?: string;

  // Calculation
  calculatedAmount?: number;
  difference?: number;
  grounds?: string[];
}

interface TaxDisputeWizardProps {
  onComplete: () => void;
}

export function TaxDisputeWizard({ onComplete }: TaxDisputeWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('tax-type');
  const [disputeData, setDisputeData] = useState<TaxDisputeData>({
    taxType: '',
    taxPeriod: new Date().getFullYear().toString(),
    region: 'Москва',
  });

  const steps: WizardStep[] = ['tax-type', 'vehicle-info', 'requirement', 'calculation', 'documents'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = (data: Partial<TaxDisputeData>) => {
    setDisputeData({ ...disputeData, ...data });
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'tax-type':
        return (
          <TaxTypeStep
            data={disputeData}
            onNext={handleNext}
          />
        );
      
      case 'vehicle-info':
        return (
          <VehicleInfoStep
            data={disputeData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 'requirement':
        return (
          <TaxRequirementStep
            data={disputeData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 'calculation':
        return (
          <CalculationStep
            data={disputeData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 'documents':
        return (
          <DocumentGenerationStep
            data={disputeData}
            onComplete={onComplete}
            onBack={handleBack}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                index <= currentStepIndex
                  ? 'bg-[var(--tg-theme-button-color,#2563eb)]'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-[var(--tg-theme-hint-color,#999999)] text-center">
          Шаг {currentStepIndex + 1} из {steps.length}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-[var(--tg-theme-secondary-bg-color,#ffffff)] rounded-lg shadow-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
}

