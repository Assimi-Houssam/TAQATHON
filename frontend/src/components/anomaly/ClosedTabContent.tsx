"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText
} from "lucide-react";
import { AnomalyWithRelations } from "@/types/anomaly";

interface ClosedTabContentProps {
  anomaly: AnomalyWithRelations;
}

export function ClosedTabContent({ anomaly }: ClosedTabContentProps) {
  const rexNotes = anomaly.rex?.notes || "";
  const lessonsLearned = anomaly.rex?.lessons_learned || "";



  return (
    <div className="space-y-6">
      {/* REX Documentation */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
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
            {anomaly.rex?.notes && (
              <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <span className="text-xs font-medium text-green-700">Documented</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* REX Notes Section */}
          <div className="space-y-3">
            <Label htmlFor="rex-notes" className="text-sm font-semibold text-gray-900">
              Resolution Documentation
            </Label>
            <Textarea
              id="rex-notes"
              value={rexNotes}
              readOnly
              placeholder="No documentation provided"
              rows={5}
              className="min-h-[120px] border-gray-200 bg-gray-50 text-gray-700 cursor-default"
            />
          </div>
          
          {/* Lessons Learned Section */}
          <div className="space-y-3">
            <Label htmlFor="lessons-learned" className="text-sm font-semibold text-gray-900">
              Lessons Learned & Future Prevention
            </Label>
            <Textarea
              id="lessons-learned"
              value={lessonsLearned}
              readOnly
              placeholder="No lessons documented"
              rows={4}
              className="border-gray-200 bg-gray-50 text-gray-700 cursor-default"
            />
          </div>
          
          {/* Supporting Documentation Section */}
          {anomaly.rex?.file_path && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">
                Supporting Documentation
              </Label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Documentation attached</span>
                </div>
              </div>
            </div>
          )}

          {/* Existing Documentation Display */}
          {anomaly.rex?.file_path && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 