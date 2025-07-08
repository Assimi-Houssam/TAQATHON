"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Upload,
  CheckCircle,
  Loader2,
  X,
  AlertTriangle,
  Minus,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnomalyMutations } from "@/hooks/useAnomalies";
import { AnomalyFormData, AnomalyOrigin } from "@/types/anomaly";
import { toast } from "sonner";

interface FormData {
  // Mandatory
  anomaly_description: string;
  equipment_description: string;

  // Important but not mandatory
  equipment_number: string;
  system_number: string;
  section: string;

  // Optional
  comment: string;
  file?: File;
  date_detection: string;

  // AI Generated
  process_safety: number;
  fiabilite_integrite: number;
  disponibilite: number;
}

interface NewAnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NewAnomalyModal({ isOpen, onClose, onSuccess }: NewAnomalyModalProps) {
  const t = useTranslations("sidebar.pages");
  
  // React Query mutations
  const { createAnomaly } = useAnomalyMutations();

  // Modal State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    anomaly_description: "",
    equipment_description: "",
    equipment_number: "",
    system_number: "",
    section: "",
    comment: "",
    process_safety: 0,
    fiabilite_integrite: 0,
    disponibilite: 0,
    date_detection: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FormData, value: string | number | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.anomaly_description.trim()) {
      newErrors.anomaly_description = "Anomaly description is required";
    }
    if (!formData.equipment_description.trim()) {
      newErrors.equipment_description = "Equipment description is required";
    }
    if (!formData.date_detection) {
      newErrors.date_detection = "Date of detection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      setIsLoading(true);

      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          process_safety: Math.floor(Math.random() * 5) + 1,
          fiabilite_integrite: Math.floor(Math.random() * 5) + 1,
          disponibilite: Math.floor(Math.random() * 5) + 1,
        }));
        setIsLoading(false);
        setCurrentStep(4);
      }, 4500);
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && currentStep !== 3) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCriticalityChange = (field: 'process_safety' | 'fiabilite_integrite' | 'disponibilite', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields one more time
      if (!validateStep1()) {
        toast.error("Please fill in all required fields.");
        return;
      }

      // Map form data to API structure
      const anomalyData: AnomalyFormData = {
        num_equipments: formData.equipment_number,
        descreption_anomalie: formData.anomaly_description,
        date_detection: formData.date_detection,
        systeme: formData.system_number,
        section_proprietaire: formData.section,
        origine: 'ORACLE', // Default value since not captured in form
        process_safty: formData.process_safety.toString(),
        fiablite_integrite: formData.fiabilite_integrite.toString(),
        disponsibilite: formData.disponibilite.toString(),
        Criticite: (formData.process_safety + formData.fiabilite_integrite + formData.disponibilite).toString(),
        comment: [
          formData.equipment_description ? `Equipment: ${formData.equipment_description}` : '',
          formData.comment || ''
        ].filter(Boolean).join('\n\n'),
      };

      await createAnomaly.mutateAsync(anomalyData);
      
      toast.success("Anomaly created successfully!");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting anomaly:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create anomaly. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (validTypes.includes(file.type)) {
        handleInputChange('file', file);
      } else {
        alert('Please upload a valid file format (.pdf, .jpg, .png)');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      anomaly_description: "",
      equipment_description: "",
      equipment_number: "",
      system_number: "",
      section: "",
      comment: "",
      process_safety: 0,
      fiabilite_integrite: 0,
      disponibilite: 0,
      date_detection: new Date().toISOString().split('T')[0],
    });
    setCurrentStep(1);
    setErrors({});
    createAnomaly.reset(); // Reset mutation state
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              step <= currentStep
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div
              className={cn(
                "w-12 h-0.5 mx-2 transition-all duration-300",
                step < currentStep ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Anomaly Report</h2>
              <p className="text-sm text-gray-600 mt-1">Complete the form to submit your anomaly report</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <StepIndicator />

          <div className="space-y-6">
            {/* Error Alert */}
            {createAnomaly.isError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {(createAnomaly.error as any)?.response?.data?.message || 
                   (createAnomaly.error as Error)?.message || 
                   "An error occurred while creating the anomaly."}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Mandatory Inputs */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mandatory Information</h3>
                  <p className="text-sm text-gray-600">Please provide the required details about the anomaly</p>
                </div>

                <div>
                  <Label htmlFor="anomaly_description" className="text-sm font-medium text-gray-700">
                    Anomaly Description *
                  </Label>
                  <Textarea
                    id="anomaly_description"
                    placeholder="Describe the anomaly in detail..."
                    value={formData.anomaly_description}
                    onChange={(e) => handleInputChange('anomaly_description', e.target.value)}
                    rows={4}
                    className={cn(
                      "mt-1",
                      errors.anomaly_description && "border-red-500"
                    )}
                  />
                  {errors.anomaly_description && (
                    <p className="text-red-500 text-xs mt-1">{errors.anomaly_description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="equipment_description" className="text-sm font-medium text-gray-700">
                    Equipment Description *
                  </Label>
                  <Textarea
                    id="equipment_description"
                    placeholder="Describe the equipment in detail..."
                    value={formData.equipment_description}
                    onChange={(e) => handleInputChange('equipment_description', e.target.value)}
                    rows={4}
                    className={cn(
                      "mt-1",
                      errors.equipment_description && "border-red-500"
                    )}
                  />
                  {errors.equipment_description && (
                    <p className="text-red-500 text-xs mt-1">{errors.equipment_description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="date_detection" className="text-sm font-medium text-gray-700">
                    Date of Detection *
                  </Label>
                  <Input
                    id="date_detection"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('date_detection', e.target.value)}
                    className={cn(
                      "mt-1",
                      errors.date_detection && "border-red-500"
                    )}
                  />
                  {errors.date_detection && (
                    <p className="text-red-500 text-xs mt-1">{errors.date_detection}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Secondary Input */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Additional Information</h3>
                  <p className="text-sm text-gray-600">Please provide additional details if available</p>
                </div>

                <div>
                  <Label htmlFor="equipment_number" className="text-sm font-medium text-gray-700">
                    Equipment Number
                  </Label>
                  <Input
                    id="equipment_number"
                    type="text"
                    placeholder="Enter equipment number"
                    value={formData.equipment_number}
                    onChange={(e) => handleInputChange('equipment_number', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="system_number" className="text-sm font-medium text-gray-700">
                    System Number
                  </Label>
                  <Input
                    id="system_number"
                    type="text"
                    placeholder="Enter system number"
                    value={formData.system_number}
                    onChange={(e) => handleInputChange('system_number', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="section" className="text-sm font-medium text-gray-700">
                    Section
                  </Label>
                  <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MC">MC</SelectItem>
                      <SelectItem value="MD">MD</SelectItem>
                      <SelectItem value="MM">MM</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="CT">CT</SelectItem>
                      <SelectItem value="EL">EL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                    Comment (Optional)
                  </Label>
                  <Input
                    id="comment"
                    type="text"
                    placeholder="Enter any additional comments"
                    value={formData.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="modal-file" className="text-sm font-medium text-gray-700">
                    Upload Attachment (Optional)
                  </Label>
                  <div className="mt-1 flex items-center gap-3">
                    <Input
                      id="modal-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleModalFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('modal-file')?.click()}
                      className="flex items-center gap-2 hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </Button>
                    {formData.file && (
                      <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                        {formData.file.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: AI Loading */}
            {currentStep === 3 && (
              <div className="text-center py-16">
                {/* Enhanced AI Visual */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                  {/* Floating particles */}
                  <div className="absolute top-2 left-8 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute top-8 right-2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping opacity-40" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-500 rounded-full animate-ping opacity-50" style={{animationDelay: '2s'}}></div>
                  <div className="absolute bottom-2 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-60" style={{animationDelay: '0.5s'}}></div>
                  
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
                  
                  {/* Main AI circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {/* AI Icon with subtle rotation */}
                    <div className="animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9l-5.91 1.74L12 17l-4.09-6.26L2 9l6.91-1.74L12 2zm0 4.74L10.91 9.5 8 10.26l2.91.76L12 13.74l1.09-2.72L16 10.26l-2.91-.76L12 6.74z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Spinning rings */}
                  <div className="absolute inset-0 border-2 border-blue-300 border-t-transparent rounded-full animate-spin opacity-60"></div>
                  <div className="absolute inset-1 border border-blue-400 border-b-transparent rounded-full animate-spin opacity-30" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
                </div>

                {/* AI Analysis Message */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-gray-600">
                    Analyzing your anomaly data to generate criticality scores...
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Criticality Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI-Generated Criticality Assessment
                  </h3>
                  <p className="text-sm text-gray-600">
                    Our AI system has analyzed your anomaly and generated the following criticality scores:
                  </p>
                </div>

                {/* Anomaly Summary Card */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-4">
                    {/* Anomaly Description - Full Width */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Anomaly Description</span>
                      <p className="text-sm font-semibold text-gray-900 leading-relaxed bg-white px-3 py-2 rounded-md border border-gray-100 line-clamp-1">
                        {formData.anomaly_description || '-'}
                      </p>
                    </div>
                    
                    {/* Equipment Info - Same Line */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Equipment Information</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                          <span className="text-xs text-gray-500">Number</span>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{formData.equipment_number || '-'}</p>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                          <span className="text-xs text-gray-500">Description</span>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{formData.equipment_description || '-'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* System Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500">System Number</span>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{formData.system_number || '-'}</p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500">Section</span>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{formData.section || '-'}</p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                        <span className="text-xs text-gray-500">Date Detected</span>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{formData.date_detection || '-'}</p>
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    {(formData.comment || formData.file) && (
                      <div className="space-y-3 pt-2 border-t border-gray-200">
                        {formData.comment && (
                          <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                            <span className="text-xs text-gray-500">Comment</span>
                            <p className="text-sm font-semibold text-gray-900">{formData.comment}</p>
                          </div>
                        )}
                        {formData.file && (
                          <div className="bg-white px-3 py-2 rounded-md border border-gray-100">
                            <span className="text-xs text-gray-500">Attachment</span>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <Upload className="w-3 h-3 text-gray-400" />
                              {formData.file.name}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Criticality Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Process Safety */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Process Safety</Label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('process_safety', Math.max(1, formData.process_safety - 1))}
                        disabled={formData.process_safety <= 1}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <span className="text-base font-semibold text-gray-900">{formData.process_safety}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('process_safety', Math.min(5, formData.process_safety + 1))}
                        disabled={formData.process_safety >= 5}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Reliability & Integrity */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reliability</Label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('fiabilite_integrite', Math.max(1, formData.fiabilite_integrite - 1))}
                        disabled={formData.fiabilite_integrite <= 1}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <span className="text-base font-semibold text-gray-900">{formData.fiabilite_integrite}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('fiabilite_integrite', Math.min(5, formData.fiabilite_integrite + 1))}
                        disabled={formData.fiabilite_integrite >= 5}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Availability</Label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-200/60 bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('disponibilite', Math.max(1, formData.disponibilite - 1))}
                        disabled={formData.disponibilite <= 1}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <span className="text-base font-semibold text-gray-900">{formData.disponibilite}</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCriticalityChange('disponibilite', Math.min(5, formData.disponibilite + 1))}
                        disabled={formData.disponibilite >= 5}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/80"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {currentStep !== 4 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || currentStep === 3}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}

              <div className={cn("flex gap-2", currentStep === 4 && "ml-auto")}>
                {currentStep < 4 && currentStep !== 3 && (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}

                {currentStep === 4 && (
                  <Button
                    onClick={handleSubmit}
                    disabled={createAnomaly.isPending}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {createAnomaly.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirm & Submit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 