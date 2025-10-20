'use client';

import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ 
  currentStep, 
  totalSteps, 
  steps, 
  className = '' 
}) => {
  return (
    <div className={`stepper ${className}`}>
      <div className="stepper-progress">
        <div 
          className="stepper-progress-bar" 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      <div className="stepper-steps">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`stepper-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="stepper-step-circle">
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="stepper-step-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
