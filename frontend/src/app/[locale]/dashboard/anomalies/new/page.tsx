"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Upload,
  CheckCircle,
  Loader2,
  Star,
  Plus,
  X,
  Download,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  FileSpreadsheet,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FormData {
  // Step 1 - Mandatory
  equipment: string;
  description: string;
  date_apparition: string;
  origin: string;

  // Step 2 - Secondary
  code: string;
  file?: File;

  // Step 4 - AI Generated
  process_safety: number;
  fiabilite_integrite: number;
  disponibilite: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  recordsTotal?: number;
  recordsProcessed?: number;
  recordsValid?: number;
  recordsInvalid?: number;
  errors?: string[];
}

interface PreviewRecord {
  id: string;
  num_equipments: string;
  unite: string;
  systeme: string;
  descreption_anomalie: string;
  origine: string;
  section_proprietaire: string;
  Criticite: string;
  status: 'valid' | 'invalid' | 'warning';
  errors?: string[];
}

export default function AddAnomaliesPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Anomaly Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewRecords, setPreviewRecords] = useState<PreviewRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isRequiredFieldsOpen, setIsRequiredFieldsOpen] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'batch' | 'single' | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchCurrentStep, setBatchCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    equipment: "",
    description: "",
    date_apparition: "",
    origin: "",
    code: "",
    process_safety: 0,
    fiabilite_integrite: 0,
    disponibilite: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock preview data for batch upload
  const mockPreviewRecords: PreviewRecord[] = [
    {
      id: "1",
      num_equipments: "EQ-001",
      unite: "Production Unit A",
      systeme: "Pressure Control System",
      descreption_anomalie: "Pressure sensor showing irregular readings",
      origine: "Sensor Malfunction",
      section_proprietaire: "Production",
      Criticite: "HIGH",
      status: "valid"
    },
    {
      id: "2",
      num_equipments: "EQ-002",
      unite: "Production Unit B",
      systeme: "Temperature Control",
      descreption_anomalie: "Temperature fluctuations outside normal range",
      origine: "Calibration Drift",
      section_proprietaire: "Maintenance",
      Criticite: "MEDIUM",
      status: "valid"
    },
    {
      id: "3",
      num_equipments: "",
      unite: "Production Unit C",
      systeme: "Vibration Monitoring",
      descreption_anomalie: "Excessive vibration detected in pump bearing",
      origine: "Mechanical Wear",
      section_proprietaire: "",
      Criticite: "HIGH",
      status: "invalid",
      errors: ["Equipment number missing", "Owner section required"]
    },
    {
      id: "4",
      num_equipments: "EQ-004",
      unite: "Production Unit D",
      systeme: "Flow Control",
      descreption_anomalie: "Flow rate below minimum threshold",
      origine: "Blockage",
      section_proprietaire: "Operations",
      Criticite: "INVALID_VALUE",
      status: "invalid",
      errors: ["Criticality must be LOW, MEDIUM, or HIGH"]
    },
    {
      id: "5",
      num_equipments: "EQ-005",
      unite: "",
      systeme: "Safety System",
      descreption_anomalie: "Emergency stop button not responding",
      origine: "Electrical Issue",
      section_proprietaire: "Safety",
      Criticite: "HIGH",
      status: "invalid",
      errors: ["Unit field cannot be empty"]
    }
  ];

  const handleInputChange = (field: keyof FormData, value: string | number | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipment.trim()) {
      newErrors.equipment = "Equipment name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date_apparition) {
      newErrors.date_apparition = "Date of apparition is required";
    }
    if (!formData.origin) {
      newErrors.origin = "Origin is required";
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Submitting anomaly:", formData);
      setIsModalOpen(false);
      router.push("/dashboard/anomalies");
    } catch (error) {
      console.error("Error submitting anomaly:", error);
      setIsSubmitting(false);
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

  // Batch Upload Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      // Validate file type
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload CSV or Excel files.`);
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'pending'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f =>
          f.id === newFile.id ? { ...f, status: 'processing' } : f
        ));

        setTimeout(() => {
          setUploadedFiles(prev => prev.map(f =>
            f.id === newFile.id
              ? {
                ...f,
                status: 'success',
                recordsTotal: 25,
                recordsProcessed: 25,
                recordsValid: 22,
                recordsInvalid: 3
              }
              : f
          ));
          setPreviewRecords(mockPreviewRecords);
          setShowPreview(true);
          setIsRequiredFieldsOpen(false); // Auto-close required fields when preview shows
          
          // Auto-advance to step 2 after a short delay when file processing is complete
          setTimeout(() => {
            if (isBatchModalOpen && batchCurrentStep === 1) {
              setBatchCurrentStep(2);
            }
          }, 1000);
        }, 2000);
      }, 1000);
    });
  };

    const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setIsRequiredFieldsOpen(false); // Auto-close required fields when upload starts
    
    // Auto-advance to step 3 in batch modal if open
    if (isBatchModalOpen && batchCurrentStep === 2) {
      setBatchCurrentStep(3);
    }
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (uploadedFiles.length === 1) {
      setShowPreview(false);
      setPreviewRecords([]);
    }
  };

  const handleDownloadTemplate = () => {
    console.log("Downloading template...");
    // Create a sample CSV template
    const csvContent = "num_equipments,descreption_anomalie,section_proprietaire,Criticite,unite,systeme,origine,fiablite_integrite,disponsibilite,process_safty\nEQ-001,Pressure sensor showing irregular readings,Production,HIGH,Production Unit A,Pressure Control System,Sensor Malfunction,3,4,2\nEQ-002,Temperature fluctuations outside normal range,Maintenance,MEDIUM,Production Unit B,Temperature Control,Calibration Drift,2,3,1";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anomaly_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setFormData({
      equipment: "",
      description: "",
      date_apparition: "",
      origin: "",
      code: "",
      process_safety: 0,
      fiabilite_integrite: 0,
      disponibilite: 0,
    });
    setCurrentStep(1);
    setErrors({});
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openBatchModal = () => {
    setIsBatchModalOpen(true);
    setBatchCurrentStep(1);
    setUploadedFiles([]);
    setPreviewRecords([]);
    setShowPreview(false);
    setUploadComplete(false);
    setIsRequiredFieldsOpen(true);
  };

  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
    setBatchCurrentStep(1);
    setUploadedFiles([]);
    setPreviewRecords([]);
    setShowPreview(false);
    setUploadComplete(false);
  };

  const handleBatchNext = () => {
    if (batchCurrentStep === 1 && uploadedFiles.length === 0) {
      alert("Please upload at least one file before proceeding.");
      return;
    }
    if (batchCurrentStep < 3) {
      setBatchCurrentStep(batchCurrentStep + 1);
    }
  };

  const handleBatchPrevious = () => {
    if (batchCurrentStep > 1) {
      setBatchCurrentStep(batchCurrentStep - 1);
    }
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

  const BatchStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { number: 1, icon: Upload, label: "Upload" },
        { number: 2, icon: CheckCircle, label: "Review" },
        { number: 3, icon: Send, label: "Complete" }
      ].map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 border-2",
                step.number <= batchCurrentStep
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              )}
            >
              {step.number < batchCurrentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium mt-1.5 transition-colors duration-300",
              step.number <= batchCurrentStep ? "text-blue-600" : "text-gray-400"
            )}>
              {step.label}
            </span>
          </div>
          {index < 2 && (
            <div
              className={cn(
                "w-16 h-px mx-3 transition-all duration-300",
                step.number < batchCurrentStep ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const RatingDisplay = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-5 h-5 transition-all duration-200",
              star <= value ? "text-yellow-400 fill-current" : "text-gray-300"
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">({value}/5)</span>
      </div>
    </div>
  );

  const validRecords = previewRecords.filter(r => r.status === 'valid');
  const invalidRecords = previewRecords.filter(r => r.status === 'invalid');

  return (
    <div className="container mx-auto px-4 py-6">
            <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/dashboard/anomalies")}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Anomaly Management</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Add Anomalies</span>
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Anomalies</h1>
            <p className="text-sm text-gray-600">Choose your preferred method to add anomalies to the system</p>
          </div>
        </div>
      </div>

      {/* Method Selection Cards */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer group",
              selectedMethod === 'batch' 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-blue-300"
            )}
            onClick={() => {
              setSelectedMethod('batch');
              openBatchModal();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                selectedMethod === 'batch' 
                  ? "bg-blue-600 text-white" 
                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
              )}>
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Upload</h3>
              <p className="text-sm text-gray-600 mb-4">Upload multiple anomalies at once using CSV or Excel files</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>Faster for multiple records</span>
                <span>•</span>
                <span>Template provided</span>
              </div>
              {selectedMethod === 'batch' && (
                <div className="mt-4">
                  <Badge className="bg-blue-600 text-white">Selected</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer group",
              selectedMethod === 'single' 
                ? "border-green-500 bg-green-50" 
                : "border-gray-200 hover:border-green-300"
            )}
            onClick={() => {
              setSelectedMethod('single');
              openModal();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                selectedMethod === 'single' 
                  ? "bg-green-600 text-white" 
                  : "bg-green-100 text-green-600 group-hover:bg-green-200"
              )}>
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Single Anomaly</h3>
              <p className="text-sm text-gray-600 mb-4">Add one anomaly at a time with guided form</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>Step-by-step guidance</span>
                <span>•</span>
                <span>AI-powered analysis</span>
              </div>
              {selectedMethod === 'single' && (
                <div className="mt-4">
                  <Badge className="bg-green-600 text-white">Selected</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Anomaly Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
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
                  onClick={closeModal}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <StepIndicator />

              <div className="space-y-6">
                {/* Step 1: Mandatory Inputs */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Mandatory Information</h3>
                      <p className="text-sm text-gray-600">Please provide the required details about the anomaly</p>
                    </div>

                    <div>
                      <Label htmlFor="equipment" className="text-sm font-medium text-gray-700">
                        Equipment Name *
                      </Label>
                      <Input
                        id="equipment"
                        type="text"
                        placeholder="Enter equipment name"
                        value={formData.equipment}
                        onChange={(e) => handleInputChange('equipment', e.target.value)}
                        className={cn(
                          "mt-1",
                          errors.equipment && "border-red-500"
                        )}
                      />
                      {errors.equipment && (
                        <p className="text-red-500 text-xs mt-1">{errors.equipment}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the anomaly in detail..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className={cn(
                          "mt-1",
                          errors.description && "border-red-500"
                        )}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="date_apparition" className="text-sm font-medium text-gray-700">
                        Date of Apparition *
                      </Label>
                      <Input
                        id="date_apparition"
                        type="date"
                        value={formData.date_apparition}
                        onChange={(e) => handleInputChange('date_apparition', e.target.value)}
                        className={cn(
                          "mt-1",
                          errors.date_apparition && "border-red-500"
                        )}
                      />
                      {errors.date_apparition && (
                        <p className="text-red-500 text-xs mt-1">{errors.date_apparition}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="origin" className="text-sm font-medium text-gray-700">
                        Origin *
                      </Label>
                      <Select value={formData.origin} onValueChange={(value) => handleInputChange('origin', value)}>
                        <SelectTrigger className={cn(
                          "mt-1",
                          errors.origin && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select origin system" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IBM Maximo">IBM Maximo</SelectItem>
                          <SelectItem value="Oracle">Oracle</SelectItem>
                          <SelectItem value="APM">APM</SelectItem>
                          <SelectItem value="EMC">EMC</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.origin && (
                        <p className="text-red-500 text-xs mt-1">{errors.origin}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Secondary Input */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Details</h3>
                      <p className="text-sm text-gray-600">Optional information to enhance your report</p>
                    </div>

                    <div>
                      <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                        Code (Optional)
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="Enter anomaly code"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="modal-file" className="text-sm font-medium text-gray-700">
                        Upload File (Optional)
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
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 border-2 border-blue-300 rounded-full border-b-transparent animate-spin animate-reverse"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      AI Analysis in Progress
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Our system is analyzing the anomaly... Please wait.
                    </p>
                    <div className="flex justify-center">
                      <div className="bg-blue-50 rounded-full px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 inline mr-2" />
                        <span className="text-sm text-blue-600">Processing data...</span>
                      </div>
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

                    <div className="grid gap-4">
                      <RatingDisplay
                        value={formData.process_safety}
                        label="Process Safety"
                      />
                      <RatingDisplay
                        value={formData.fiabilite_integrite}
                        label="Reliability & Integrity"
                      />
                      <RatingDisplay
                        value={formData.disponibilite}
                        label="Availability"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
                      <p className="text-sm text-blue-800">
                        Based on the analysis, this anomaly has been classified with the above criticality scores.
                        Please review and confirm to submit the anomaly report.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || currentStep === 3}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
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
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
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
      )}

      {/* Batch Upload Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBatchModal}
          />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Batch Upload</h2>
                    <p className="text-sm text-gray-500">Upload multiple anomalies using CSV or Excel files</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeBatchModal}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{batchCurrentStep}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {batchCurrentStep === 1 ? "Upload Your Files" :
                       batchCurrentStep === 2 ? "Review Your Data" :
                       uploadComplete ? "Upload Complete" : "Uploading Data"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {batchCurrentStep === 1 ? "Upload CSV or Excel files containing your anomaly data" :
                       batchCurrentStep === 2 ? "Confirm the validation results before uploading" :
                       uploadComplete ? "Successfully processed your anomaly records" : "Processing your anomaly records..."}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Step {batchCurrentStep} of 3
                </div>
              </div>

              <BatchStepIndicator />

              <div className="space-y-6">
                {/* Step 1: Upload Files */}
                {batchCurrentStep === 1 && (
                  <div className="space-y-6">

                    <div className="max-w-2xl mx-auto space-y-5">
                      <div className="flex justify-center">
                        <Button 
                          onClick={handleDownloadTemplate}
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 rounded-lg"
                        >
                          <Download className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Download Template</span>
                        </Button>
                      </div>

                      <div className="relative">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        <div 
                          className={cn(
                            "group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden",
                            isDragOver 
                              ? "border-blue-400 bg-blue-50 scale-[1.01]" 
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const files = Array.from(e.dataTransfer.files);
                            processFiles(files);
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300",
                            isDragOver 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                              : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                          )}>
                            <Upload className="w-6 h-6" />
                          </div>
                          <h4 className={cn(
                            "text-lg font-semibold mb-2 transition-colors duration-300",
                            isDragOver ? "text-blue-700" : "text-gray-900"
                          )}>
                            {isDragOver ? "Drop files here" : "Drag & drop files"}
                          </h4>
                          <p className="text-gray-500 text-sm mb-4">or click to browse your computer</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <FileSpreadsheet className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">CSV, XLSX, XLS files</span>
                          </div>
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileText className="w-4 h-4" />
                            Uploaded Files ({uploadedFiles.length})
                          </div>
                          <div className="space-y-2">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className={cn(
                                "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                                file.status === 'success' ? "bg-green-50 border-green-200" :
                                file.status === 'processing' ? "bg-blue-50 border-blue-200" :
                                "bg-gray-50 border-gray-200"
                              )}>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    file.status === 'processing' ? "bg-blue-100" :
                                    file.status === 'success' ? "bg-green-100" :
                                    "bg-gray-100"
                                  )}>
                                    {file.status === 'processing' ? (
                                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                    ) : file.status === 'success' ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-gray-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(file.id)}
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Review Results */}
                {batchCurrentStep === 2 && (
                  <div className="space-y-6">

                    <div className="max-w-2xl mx-auto space-y-5">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{previewRecords.length}</div>
                          <div className="text-gray-600 font-medium text-sm">Total Records</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-200">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mb-1">{validRecords.length}</div>
                          <div className="text-blue-700 font-medium text-sm">Valid Records</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="text-2xl font-bold text-gray-600 mb-1">{invalidRecords.length}</div>
                          <div className="text-gray-700 font-medium text-sm">Invalid Records</div>
                        </div>
                      </div>

                      {invalidRecords.length === 0 ? (
                        <div className="text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">All Records Valid</h4>
                          <p className="text-gray-600 text-sm">Ready to upload {validRecords.length} anomaly records</p>
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-6 h-6 text-gray-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Validation Errors Found</h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {validRecords.length} records ready, {invalidRecords.length} need corrections
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                            <Info className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {(() => {
                                const errorTypes = invalidRecords.flatMap(r => r.errors || []);
                                const missingFields = errorTypes.filter(e => e.includes('missing') || e.includes('empty')).length;
                                const invalidValues = errorTypes.filter(e => e.includes('must be') || e.includes('INVALID')).length;
                                
                                if (missingFields > 0 && invalidValues > 0) {
                                  return `${missingFields} missing fields, ${invalidValues} invalid values`;
                                } else if (missingFields > 0) {
                                  return `${missingFields} required fields missing`;
                                } else if (invalidValues > 0) {
                                  return `${invalidValues} invalid format values`;
                                } else {
                                  return 'Check data format and try again';
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Upload Complete */}
                {batchCurrentStep === 3 && (
                  <div className="space-y-6">
                    {!uploadComplete ? (
                      <div className="text-center space-y-5">
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto relative">
                              <div className="absolute inset-0 bg-blue-200 rounded-2xl animate-ping opacity-30"></div>
                              <Upload className="w-8 h-8 text-blue-600 relative z-10" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Uploading Your Data</h3>
                            <p className="text-gray-500 text-sm">Processing {validRecords.length} anomaly records...</p>
                          </div>
                        </div>

                        <div className="max-w-md mx-auto space-y-3">
                          <div className="relative">
                            <Progress value={uploadProgress} className="w-full h-2 bg-gray-100" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-pulse" 
                                 style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-blue-600">{uploadProgress}% complete</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Records processed</span>
                            <span>{Math.round((uploadProgress / 100) * validRecords.length)} of {validRecords.length}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto relative">
                            <div className="absolute inset-0 bg-blue-200 rounded-2xl animate-ping opacity-30"></div>
                            <CheckCircle className="w-10 h-10 text-blue-600 relative z-10" />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-2xl font-semibold text-gray-900">Upload Complete!</h3>
                          <p className="text-gray-600 text-sm">
                            Successfully uploaded <span className="font-semibold text-blue-600">{validRecords.length}</span> anomaly records
                          </p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-3">
                          <Button 
                            onClick={() => {
                              closeBatchModal();
                              router.push("/dashboard/anomalies");
                            }}
                            className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-200 rounded-xl"
                            size="default"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            View Your Anomalies
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setBatchCurrentStep(1);
                              setUploadComplete(false);
                              setUploadedFiles([]);
                              setPreviewRecords([]);
                              setShowPreview(false);
                            }}
                            className="w-full h-10 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                            size="default"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Upload More Files
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                {batchCurrentStep === 2 && (
                  <div className="flex justify-center pt-8 border-t border-gray-100">
                    <Button
                      onClick={handleUpload}
                      className="px-8 py-3 text-base font-semibold transition-all duration-200 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200"
                      size="default"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Upload {validRecords.length} Records
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 