"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Download,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  FileSpreadsheet,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnomalyMutations } from "@/hooks/useAnomalies";
import { toast } from "sonner";

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
  file?: File;
}

interface PreviewRecord {
  id: string;
  num_equipments: string;
  unite: string;
  systeme: string;
  descreption_anomalie: string;
  origine: string;
  section_proprietaire: string;
  criticite: string;
  status: 'valid' | 'invalid' | 'warning';
  errors?: string[];
}

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BatchUploadModal({ isOpen, onClose, onSuccess }: BatchUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Query mutations
  const { batchUpload } = useAnomalyMutations();

  // Modal State
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewRecords, setPreviewRecords] = useState<PreviewRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      // Validate file type - only Excel files
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Please upload Excel files (.xlsx, .xls) only.`);
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'pending',
        file: file
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
          // TODO: Replace with actual API response data
          setPreviewRecords([]);
          setShowPreview(true);

          // Auto-advance to step 2 after a short delay when file processing is complete
          setTimeout(() => {
            if (currentStep === 1) {
              setCurrentStep(2);
            }
          }, 1000);
        }, 2000);
      }, 1000);
    });
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Auto-advance to step 3
    setCurrentStep(3);

    try {
      // Upload each file using the batch upload mutation
      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        
        if (!uploadedFile.file) {
          throw new Error(`File object missing for ${uploadedFile.name}`);
        }
        
        // Upload the file
        const result = await batchUpload.mutateAsync(uploadedFile.file);
        
        // Update progress
        setUploadProgress(((i + 1) / uploadedFiles.length) * 100);
        
        // Update file status
        setUploadedFiles(prev => prev.map(f =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: 'success',
                recordsTotal: result.success + (result.errors?.length || 0),
                recordsProcessed: result.success + (result.errors?.length || 0),
                recordsValid: result.success,
                recordsInvalid: result.errors?.length || 0,
                errors: result.errors
              }
            : f
        ));
      }
      
      setUploadComplete(true);
      setIsUploading(false);
      
      const totalSuccess = uploadedFiles.reduce((sum, file) => {
        return sum + (file.recordsValid || 0);
      }, 0);
      
      toast.success(`Successfully uploaded ${totalSuccess} anomaly records from ${uploadedFiles.length} file(s)`);
      onSuccess?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload files. Please try again.";
      toast.error(errorMessage);
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (uploadedFiles.length === 1) {
      setShowPreview(false);
      setPreviewRecords([]);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample Excel template (we'll provide a link to download a pre-made template)
    // For now, we'll create a CSV that user can save as Excel
    const csvContent = "num_equipments,descreption_anomalie,section_proprietaire,criticite,unite,systeme,origine,fiablite_integrite,disponsibilite,process_safty\nEQ-001,Pressure sensor showing irregular readings,Production,HIGH,Production Unit A,Pressure Control System,Sensor Malfunction,3,4,2\nEQ-002,Temperature fluctuations outside normal range,Maintenance,MEDIUM,Production Unit B,Temperature Control,Calibration Drift,2,3,1";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anomaly_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.info("Template downloaded. Please save as Excel format (.xlsx) before uploading.");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setPreviewRecords([]);
    setShowPreview(false);
    setUploadComplete(false);
    setIsUploading(false);
    setUploadProgress(0);
    setIsDragOver(false);
    batchUpload.reset(); // Reset mutation state
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };



  const StepIndicator = () => (
    <div className="flex items-center justify-center">
      {[
        { number: 1, icon: Upload, label: "Upload" },
        { number: 2, icon: CheckCircle, label: "Confirm" },
        { number: 3, icon: Send, label: "Complete" }
      ].map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300",
                step.number <= currentStep
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              )}
            >
              {step.number < currentStep ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium mt-2 transition-colors duration-300",
              step.number <= currentStep ? "text-blue-600" : "text-gray-400"
            )}>
              {step.label}
            </span>
          </div>
          {index < 2 && (
            <div className="flex items-center mx-3">
              <div
                className={cn(
                  "w-32 h-0.5 rounded-full transition-all duration-300",
                  step.number < currentStep ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            </div>
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

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 rounded-t-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Batch Upload</h2>
                <p className="text-sm text-gray-500">Upload multiple anomalies using Excel files</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="p-6">
            <StepIndicator />
          </div>
        </div>

        <div className="px-6 py-8">

          <div className="space-y-6">
            {/* Error Alert */}
            {batchUpload.isError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {(batchUpload.error as any)?.response?.data?.message || 
                   (batchUpload.error as Error)?.message || 
                   "An error occurred while uploading the files."}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Upload Files */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="relative">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
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
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadTemplate();
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg"
                        >
                          <Download className="h-3 w-3 mr-1.5" />
                          Template
                        </Button>
                      </div>

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
                        <span className="text-xs text-gray-600">XLSX, XLS files</span>
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

            {/* Step 2: Confirmation */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-6">
                  {/* Success icon */}
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  {/* Message */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">Ready to Upload</h3>
                    <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                      Your files have been processed successfully and are ready to be uploaded to the system.
                    </p>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={batchUpload.isPending}
                    className={`py-2 px-4 rounded-lg font-medium flex items-center gap-2 ${
                      batchUpload.isPending
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {batchUpload.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Files
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Progress/Complete */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {!uploadComplete ? (
                  <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    {/* Title and Description */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">Uploading Your Data</h3>
                      <p className="text-gray-600">Processing your anomaly records...</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto space-y-3">
                      <Progress value={uploadProgress} className="w-full h-2 bg-gray-100" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-blue-600">{uploadProgress}% complete</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    {/* Title and Description */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">Upload Complete!</h3>
                      <p className="text-gray-600">
                        Successfully uploaded <span className="font-medium text-green-600">{uploadedFiles.reduce((sum, file) => sum + (file.recordsValid || 0), 0)}</span> anomaly records
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 max-w-xs mx-auto">
                      <Button
                        onClick={() => {
                          handleClose();
                          onSuccess?.();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                        size="default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        View Your Anomalies
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(1);
                          setUploadComplete(false);
                          setUploadedFiles([]);
                          setPreviewRecords([]);
                          setShowPreview(false);
                        }}
                        className="w-full border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200"
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


          </div>
        </div>
      </div>
    </div>
  );
} 