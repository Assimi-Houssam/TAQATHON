"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText,
  Upload,
  Save,
  Edit,
  X
} from "lucide-react";
import { AnomalyWithRelations } from "@/types/anomaly";
import { useAnomalyMutations } from "@/hooks/useAnomalies";
import { toast } from "sonner";

interface ClosedTabContentProps {
  anomaly: AnomalyWithRelations;
}

export function ClosedTabContent({ anomaly }: ClosedTabContentProps) {
  const { attachRex } = useAnomalyMutations();
  
  const [isEditing, setIsEditing] = useState(!anomaly.rex?.notes);
  const [summary, setSummary] = useState(anomaly.rex?.notes || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Reset the file input
    const fileInput = document.getElementById('rex-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summary.trim() && !selectedFile) {
      toast.error("Please provide either a summary or attach a file");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const rexData = {
        summary: summary.trim(),
        ...(selectedFile && { file: selectedFile })
      };

      await attachRex.mutateAsync({
        id: anomaly.id,
        rexData
      });

      toast.success("REX documentation saved successfully");
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving REX:", error);
      toast.error("Failed to save REX documentation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSummary(anomaly.rex?.notes || "");
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* REX Documentation */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Return of Experience</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Document insights and lessons learned from this resolution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {anomaly.rex?.notes && !isEditing && (
                <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <span className="text-xs font-medium text-green-700">Documented</span>
                </div>
              )}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* REX Summary */}
              <div className="space-y-3">
                <Label htmlFor="rex-summary" className="text-sm font-semibold text-gray-900">
                  REX Summary
                </Label>
                <Textarea
                  id="rex-summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe the resolution, lessons learned, and any recommendations for future prevention..."
                  rows={6}
                  className="min-h-[150px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* File Upload */}
              <div className="space-y-3">
                <Label htmlFor="rex-file" className="text-sm font-semibold text-gray-900">
                  Supporting Documentation
                </Label>
                
                {!selectedFile ? (
                  <div className="relative">
                    <Input
                      id="rex-file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <Label
                      htmlFor="rex-file"
                      className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Click to upload a file</span>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, TXT, or image files</p>
                      </div>
                    </Label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save REX
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  REX Summary
                </Label>
                <Textarea
                  value={summary}
                  readOnly
                  placeholder="No documentation provided"
                  rows={6}
                  className="min-h-[150px] border-gray-200 bg-gray-50 text-gray-700 cursor-default"
                />
              </div>
              
              {anomaly.rex?.file_path && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900">
                    Supporting Documentation
                  </Label>
                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Documentation</h4>
                        <span className="text-blue-700 text-sm font-medium">
                          View documentation →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 