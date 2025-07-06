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
  FileSpreadsheet
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
      descreption_anomalie: "Missing equipment number",
      origine: "Unknown",
      section_proprietaire: "",
      Criticite: "HIGH",
      status: "invalid",
      errors: ["Equipment number is required", "Owner section is required"]
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
    
    files.forEach(file => {
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
        }, 2000);
      }, 1000);
    });
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
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
            <p className="text-sm text-gray-600">Upload multiple anomalies using CSV or Excel files, or add individual anomalies</p>
          </div>
          <Button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Single Anomaly
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Batch File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Upload CSV or Excel files containing anomaly data. Make sure your files follow the required format.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here or click "Select Files"</p>
                <p className="text-sm text-gray-500">Supported formats: CSV, Excel (.xlsx, .xls)</p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {file.status === 'processing' && (
                          <Badge variant="outline">Processing...</Badge>
                        )}
                        {file.status === 'success' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              {file.recordsValid}/{file.recordsTotal} valid
                            </span>
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <Badge variant="destructive">Error</Badge>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Data Preview</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      {validRecords.length} Valid
                    </Badge>
                    <Badge variant="outline" className="bg-red-50">
                      {invalidRecords.length} Invalid
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previewRecords.map((record) => (
                    <div key={record.id} className={`p-4 border rounded-lg ${
                      record.status === 'valid' ? 'border-green-200 bg-green-50' : 
                      record.status === 'invalid' ? 'border-red-200 bg-red-50' : 
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {record.status === 'valid' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {record.status === 'invalid' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            {record.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            <span className="font-medium">{record.num_equipments}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{record.descreption_anomalie}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{record.Criticite}</Badge>
                            <Badge variant="outline">{record.unite}</Badge>
                            <Badge variant="outline">{record.systeme}</Badge>
                          </div>
                          {record.errors && record.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-red-700">Errors:</p>
                              <ul className="text-sm text-red-600 list-disc list-inside">
                                {record.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Files uploaded:</span>
                  <span className="text-sm font-medium">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total records:</span>
                  <span className="text-sm font-medium">{previewRecords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valid records:</span>
                  <span className="text-sm font-medium text-green-600">{validRecords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invalid records:</span>
                  <span className="text-sm font-medium text-red-600">{invalidRecords.length}</span>
                </div>
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>num_equipments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>descreption_anomalie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>section_proprietaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Criticite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>unite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>systeme</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>origine</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>fiablite_integrite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>disponsibilite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>process_safty</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {validRecords.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {validRecords.length} Valid Records
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
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
    </div>
  );
} 