"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddFormDialog } from "@/components/ui/ocp/AddFormDialog";
import { AddFormFieldDialog } from "@/components/ui/ocp/AddFormFieldDialog";
import { FormLayoutConfig } from "@/components/ui/ocp/FormLayoutConfig";
import { FormLayoutRenderer } from "@/components/ui/ocp/FormLayoutRenderer";
import { FormsSelector } from "@/components/ui/ocp/FormsSelector";
import { useFormFields } from "@/endpoints/forms/useFormFields";
import {
  useCreateForm,
  useCreateFormField,
  useSaveFormLayout,
  useSubmitFormAnswers,
} from "@/endpoints/forms/useFormMutations";
import { useForms } from "@/endpoints/forms/useForms";
import { Grid2X2, LayoutGrid, List, Search } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

// Main component
export default function Forms() {
  const [selectedSet, setSelectedSet] = useState<string>("");
  const [showNewFormFieldDialog, setShowNewFormFieldDialog] = useState(false);
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showAddSetDialog, setShowAddSetDialog] = useState(false);
  const locale = useLocale();

  const {
    forms: filteredForms,
    isLoading: isLoadingForms,
    error: formsError,
  } = useForms(searchTerm);
  const {
    data: formFields,
    isLoading: isLoadingFields,
    error: fieldsError,
  } = useFormFields(selectedSet, locale);

  const createForm = useCreateForm();
  const createFormField = useCreateFormField();
  const submitAllAnswers = useSubmitFormAnswers();
  const saveLayout = useSaveFormLayout();

  const getSelectedFormLayout = () => {
    const selectedForm = filteredForms.find(
      (form) => form.name === selectedSet
    );
    return selectedForm?.layout;
  };

  if (formsError || fieldsError) {
    return (
      <Card className="shadow-none border-none">
        <div className="text-center text-red-500">
          Error loading forms. Please try again later.
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      <Card className="shadow-none border-none">
        <CardHeader className="sticky top-0 z-20 bg-background flex flex-row items-center justify-between">
          <CardTitle>Forms</CardTitle>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-accent" : ""}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-accent" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                className="pl-8"
                value={searchTerm}
                disabled={isLoadingForms || isLoadingFields}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLayoutConfig((prev) => !prev)}
              disabled={isLoadingForms || isLoadingFields || !selectedSet}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              {showLayoutConfig ? "Close Layout" : "Configure Layout"}
            </Button>
            <Button
              onClick={() => setShowAddSetDialog(true)}
              disabled={isLoadingForms || isLoadingFields}
            >
              Add Form
            </Button>
            {selectedSet && (
              <Button
                onClick={() => setShowNewFormFieldDialog(true)}
                disabled={isLoadingForms || isLoadingFields}
              >
                Add Field
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div
            className={`flex ${
              viewMode === "list" ? "gap-8 h-full" : "flex-col"
            }`}
          >
            <div className={viewMode === "list" ? "w-1/3" : "w-full"}>
              <FormsSelector
                isLoading={isLoadingForms}
                forms={filteredForms}
                selectedSet={selectedSet}
                onSetSelect={setSelectedSet}
                viewMode={viewMode}
              />
            </div>

            {viewMode === "list" && (
              <div className="flex-1 h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
                <div className="space-y-8 pr-4">
                  {showLayoutConfig && selectedSet && (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            Layout Configuration:
                          </span>
                          <span className="text-primary">{selectedSet}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormLayoutConfig
                          formFields={formFields ?? []}
                          initialLayout={getSelectedFormLayout()}
                          onSave={(layout) =>
                            saveLayout.mutate({
                              formName: selectedSet,
                              layout,
                            })
                          }
                          onCancel={() => setShowLayoutConfig(false)}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {selectedSet && (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            Form Fields:
                          </span>
                          <span className="text-primary">{selectedSet}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {getSelectedFormLayout() && (
                          <FormLayoutRenderer
                            formFields={formFields ?? []}
                            layout={getSelectedFormLayout()}
                            onSubmit={(data) => submitAllAnswers.mutate(data)}
                            isPending={submitAllAnswers.isPending}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {viewMode === "grid" && (
        <>
          {showLayoutConfig && selectedSet && (
            <Card className="m-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    Layout Configuration:
                  </span>
                  <span className="text-primary">{selectedSet}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormLayoutConfig
                  formFields={formFields ?? []}
                  initialLayout={getSelectedFormLayout()}
                  onSave={(layout) =>
                    saveLayout.mutate({
                      formName: selectedSet,
                      layout,
                    })
                  }
                  onCancel={() => setShowLayoutConfig(false)}
                />
              </CardContent>
            </Card>
          )}

          {selectedSet && (
            <Card className="m-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Form Fields:</span>
                  <span className="text-primary">{selectedSet}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getSelectedFormLayout() && (
                  <FormLayoutRenderer
                    formFields={formFields ?? []}
                    layout={getSelectedFormLayout()}
                    onSubmit={(data) => submitAllAnswers.mutate(data)}
                    isPending={submitAllAnswers.isPending}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AddFormDialog
        open={showAddSetDialog}
        onOpenChange={setShowAddSetDialog}
        onSubmit={(data) => createForm.mutate(data)}
        isPending={createForm.isPending}
      />
      <AddFormFieldDialog
        open={showNewFormFieldDialog}
        onOpenChange={setShowNewFormFieldDialog}
        onSubmit={(data) => createFormField.mutate(data)}
        isPending={createFormField.isPending}
        formName={selectedSet}
      />
    </div>
  );
}
