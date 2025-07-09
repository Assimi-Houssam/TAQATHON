import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import FormFieldWrapper from "@/components/ui/taqa/form/common/FormFieldWrapper";
import FormSelectWrapper from "@/components/ui/taqa/form/common/FormSelectWrapper";
import { FormFieldType } from "@/types/entities/enums/index.enum";
import {
  CreateFormFieldDto,
  createFormFieldSchema,
} from "@/types/forms-controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AddFormFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFormFieldDto) => void;
  isPending: boolean;
  formName: string;
}

export function AddFormFieldDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  formName,
}: AddFormFieldDialogProps) {
  const form = useForm<CreateFormFieldDto>({
    resolver: zodResolver(createFormFieldSchema),
    defaultValues: {
      label: "",
      type: FormFieldType.TEXT,
      required: false,
      selectOptions: "",
      order: 1,
      formName,
    },
  });

  const formFieldType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Form Field</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldWrapper
                  form={form}
                  name="order"
                  label="Order"
                  type="number"
                  required
                />
                <FormSelectWrapper
                  form={form}
                  name="type"
                  label="Type"
                  options={Object.values(FormFieldType).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  required
                />
              </div>

              <FormFieldWrapper
                form={form}
                name="label"
                label="Formfield Label"
                required
              />

              <FormFieldWrapper
                form={form}
                name="description"
                label="Description"
                inputComponent="textarea"
                className="min-h-[80px]"
                placeholder="Add additional context or instructions for this formfield (optional)"
              />

              <FormFieldWrapper
                form={form}
                name="tooltip"
                label="Tooltip"
                inputComponent="textarea"
                className="min-h-[80px]"
                placeholder="Add additional context or instructions for this formfield (optional)"
              />
            </div>

            {/* Type-specific fields */}
            {(formFieldType === FormFieldType.TEXT ||
              formFieldType === FormFieldType.NUMBER ||
              formFieldType === FormFieldType.DATE ||
              formFieldType === FormFieldType.SELECT ||
              formFieldType === FormFieldType.MULTIPLE_CHOICE) && (
              <div className="rounded-lg p-6 border border-border/50">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  {formFieldType} Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formFieldType === FormFieldType.TEXT && (
                    <>
                      <FormFieldWrapper
                        form={form}
                        name="minLength"
                        label="Min Length"
                        type="number"
                      />
                      <FormFieldWrapper
                        form={form}
                        name="maxLength"
                        label="Max Length"
                        type="number"
                      />
                      <FormFieldWrapper
                        form={form}
                        name="pattern"
                        label="Pattern (RegEx)"
                      />
                    </>
                  )}

                  {formFieldType === FormFieldType.NUMBER && (
                    <>
                      <FormFieldWrapper
                        form={form}
                        name="minValue"
                        label="Min Value"
                        type="number"
                      />
                      <FormFieldWrapper
                        form={form}
                        name="maxValue"
                        label="Max Value"
                        type="number"
                      />
                      <FormFieldWrapper
                        form={form}
                        name="step"
                        label="Step"
                        type="number"
                      />
                    </>
                  )}

                  {formFieldType === FormFieldType.DATE && (
                    <>
                      <FormFieldWrapper
                        form={form}
                        name="minDate"
                        label="Min Date"
                        type="date"
                      />
                      <FormFieldWrapper
                        form={form}
                        name="maxDate"
                        label="Max Date"
                        type="date"
                      />
                    </>
                  )}

                  {(formFieldType === FormFieldType.SELECT ||
                    formFieldType === FormFieldType.MULTIPLE_CHOICE) && (
                    <div className="md:col-span-3">
                      <FormFieldWrapper
                        form={form}
                        inputComponent="textarea"
                        name="selectOptions"
                        label="Options (one per line)"
                        placeholder="Enter each option on a new line"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {formFieldType === FormFieldType.FILE && (
              <div className="rounded-lg p-6 border border-border/50">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                  File Upload Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormFieldWrapper
                    form={form}
                    name="maxFileSize"
                    label="Max File Size (MB)"
                    type="number"
                    placeholder="e.g., 10"
                  />
                  <FormFieldWrapper
                    form={form}
                    name="allowedFileTypes"
                    label="Allowed File Types"
                    placeholder="e.g., .pdf, .doc, .docx"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Form Field"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
