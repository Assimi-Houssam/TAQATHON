"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  X,
  Info,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export default function BatchUploadPage() {
  const t = useTranslations("sidebar.pages");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewRecords, setPreviewRecords] = useState<PreviewRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Mock preview data based on new schema
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
      
      // Simulate file processing
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'processing' }
            : f
        ));
        
        // Simulate completion
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
    
    // Simulate upload progress
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
    // In a real implementation, this would download an actual template file
    console.log("Downloading template...");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            <span className="text-gray-900 font-medium">Batch Upload</span>
          </nav>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Batch Upload</h1>
          <p className="text-sm text-gray-600">Upload multiple anomalies using CSV or Excel files for bulk processing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
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
                <p className="text-gray-600 mb-2">Drag and drop files here or click &quot;Select Files&quot;</p>
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
    </div>
  );
} 