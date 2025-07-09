"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Trash2, 
  FileText, 
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Paperclip
} from "lucide-react";
import { toast } from "sonner";
import { useAnomalyMutations } from "@/hooks/useAnomalies";
import { Attachments } from "@/types/anomaly";

interface AttachmentManagerProps {
  anomalyId: string;
  attachments?: Attachments[];
  readonly?: boolean;
  defaultOpen?: boolean;
}

export function AttachmentManager({ 
  anomalyId, 
  attachments = [], 
  readonly = false,
  defaultOpen = false
}: AttachmentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    uploadAttachment, 
    downloadAttachment, 
    deleteAttachment 
  } = useAnomalyMutations();

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="h-4 w-4" />;
    
    const extension = fileName.toLowerCase().split('.').pop();
    
    // Only show PDF icon since we only support PDFs
    if (extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    }
    
    return <FileText className="h-4 w-4" />;
  };

  // Helper function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    
    // Validate file type - only PDF allowed
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      await uploadAttachment.mutateAsync({ id: anomalyId, file });
      toast.success('PDF uploaded successfully');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file download
  const handleDownload = async (attachment: Attachments) => {
    if (!attachment.id) return;
    
    try {
      const blob = await downloadAttachment.mutateAsync(attachment.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name || 'attachment';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle file deletion
  const handleDelete = async (attachment: Attachments) => {
    if (!attachment.id) return;
    
    try {
      await deleteAttachment.mutateAsync({ 
        attachmentId: attachment.id, 
        anomalyId 
      });
      toast.success('Attachment deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete attachment');
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="transition-transform duration-300 ease-in-out">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <Paperclip className="h-4 w-4 text-gray-600" />
            </div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              Attachments
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {attachments.length}
          </Badge>
        </div>
      </CardHeader>
      
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <CardContent className="space-y-4 pt-0 pb-4">
          {/* Upload Area */}
          {!readonly && (
            <div 
              className={`
                relative border-2 border-dashed rounded-lg p-4 transition-all duration-200
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                disabled={isUploading}
              />
              
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-xs text-gray-600">Uploading PDF...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="h-6 w-6 text-red-600 mb-2" />
                    <p className="text-xs text-gray-600 mb-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Upload PDF
                      </button>
                      {' '}or drag & drop
                    </p>
                    <p className="text-xs text-gray-500">PDF files only • Max 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments List */}
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? 'slideInUp 300ms ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="text-gray-500 flex-shrink-0">
                      {getFileIcon(attachment.file_name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {attachment.file_name || 'Unnamed file'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      disabled={downloadAttachment.isPending}
                      className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                    >
                      {downloadAttachment.isPending ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Delete Button */}
                    {!readonly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(attachment)}
                        disabled={deleteAttachment.isPending}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        {deleteAttachment.isPending ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No PDFs attached</p>
              {!readonly && (
                <p className="text-xs text-gray-400 mt-1">
                  Upload PDF files to attach them
                </p>
              )}
            </div>
          )}

          {/* Quick Upload Button for Mobile */}
          {!readonly && attachments.length > 0 && (
            <div className="block sm:hidden pt-2 border-t border-gray-200">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-8 text-xs transition-all duration-150"
                variant="outline"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add File
              </Button>
            </div>
          )}
        </CardContent>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
} 