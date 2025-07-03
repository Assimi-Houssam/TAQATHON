import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import FormFieldWrapper from "@/components/ui/ocp/form/common/FormFieldWrapper";
import { CreateFormDto, createFormSchema } from "@/types/forms-controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface AddFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFormDto) => void;
  isPending: boolean;
}

export function AddFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddFormDialogProps) {
  const form = useForm<CreateFormDto>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldWrapper
              form={form}
              name="name"
              label="Name"
              required
              placeholder="Enter form name"
            />
            <FormFieldWrapper
              form={form}
              name="description"
              label="Description"
              inputComponent="textarea"
              placeholder="Add additional context or instructions for this form (optional)"
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Form"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
