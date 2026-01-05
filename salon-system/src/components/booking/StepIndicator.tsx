import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
        
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div key={step} className="flex flex-col items-center bg-white px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 
                  'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <span>{stepNum}</span>}
              </div>
              <span className={`text-xs font-medium mt-2 uppercase tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}