import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FormResponse, LayoutConfig } from "@/types/forms-controller";
import { Lock } from "lucide-react";

export const getFormFieldsCount = (layout?: LayoutConfig | null) => {
  if (!layout?.groups) return 0;
  return layout.groups.reduce(
    (acc: number, group: { formfieldIds: number[] }) =>
      acc + group.formfieldIds.length,
    0
  );
};

interface FormsSelectorProps {
  isLoading: boolean;
  forms: FormResponse[];
  selectedSet: string;
  onSetSelect: (name: string) => void;
  viewMode: "grid" | "list";
}

export function FormsSelector({
  isLoading,
  forms,
  selectedSet,
  onSetSelect,
  viewMode,
}: FormsSelectorProps) {
  if (viewMode === "grid") {
    return (
      <FormSetGrid
        isLoading={isLoading}
        forms={forms}
        selectedSet={selectedSet}
        onSetSelect={onSetSelect}
      />
    );
  }

  return (
    <FormSetList
      isLoading={isLoading}
      forms={forms}
      selectedSet={selectedSet}
      onSetSelect={onSetSelect}
    />
  );
}

function FormSetGrid({
  isLoading,
  forms,
  selectedSet,
  onSetSelect,
}: Omit<FormsSelectorProps, "viewMode">) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => {
        const formFieldsCount = getFormFieldsCount(form.layout);
        return (
          <Card
            key={form.name}
            onClick={() => onSetSelect(form.name)}
            className={`cursor-pointer hover:border-primary transition-colors ${
              selectedSet === form.name ? "border-primary bg-accent" : ""
            }`}
          >
            <CardContent className="pt-6">
              <div>
                <h3 className="font-medium mb-2">{form.name}</h3>
                <p className="text-muted-foreground">
                  {formFieldsCount} form fields
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FormSetList({
  isLoading,
  forms,
  selectedSet,
  onSetSelect,
}: Omit<FormsSelectorProps, "viewMode">) {
  if (isLoading) {
    return (
      <div className="relative h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-10rem)]">
      <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent z-10" />
      <ScrollArea className="h-full pt-2 pr-4">
        <div className="flex flex-col gap-3">
          {forms.map((form: FormResponse) => {
            const formFieldsCount = getFormFieldsCount(form.layout);
            return (
              <Card
                key={form.name}
                onClick={() => onSetSelect(form.name)}
                className={`
                  cursor-pointer transition-all duration-200
                  hover:border-primary/50 hover:shadow-md
                  ${
                    selectedSet === form.name
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/40"
                  }
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {form.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formFieldsCount}{" "}
                        {formFieldsCount === 1 ? "form field" : "form fields"}
                      </p>
                      {form.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {form.layout && (
                          <span className="text-xs bg-secondary/50 px-2 py-1 rounded-full">
                            Layout ready
                          </span>
                        )}
                        {form.isLocked && (
                          <div className="flex flex-col items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <div
                              className={`
                                w-2 h-2 rounded-full transition-colors
                                ${
                                  selectedSet === form.name
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                                }
                              `}
                            />
                          </div>
                        )}
                        {!form.isLocked && (
                          <div
                            className={`
                              w-2 h-2 rounded-full transition-colors
                              ${
                                selectedSet === form.name
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              }
                            `}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent z-10" />
    </div>
  );
}
