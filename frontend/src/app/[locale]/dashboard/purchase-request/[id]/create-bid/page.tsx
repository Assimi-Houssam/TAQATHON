"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CustomCard } from "@/components/ui/taqa/custom-card";
import FileUploadWrapper from "@/components/ui/taqa/form/common/FileUploadWrapper";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  budget: z.string().min(1, "Budget is required"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  description: z.string().min(1, "Description is required"),
  attachments: z.object({
    technical: z.array(z.string()),
    financial: z.array(z.string()),
    administrative: z.array(z.string()),
  }),
});

type FormProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

function AttachmentsCard({ form }: FormProps) {
  const t = useTranslations("CreateBid");

  const attachments_categories = [
    {
      key: "attachments.technical" as const,
      label: t("cards.attachments.technical"),
    },
    {
      key: "attachments.financial" as const,
      label: t("cards.attachments.financial"),
    },
    {
      key: "attachments.administrative" as const,
      label: t("cards.attachments.administrative"),
    },
  ];

  return (
    <CustomCard title={t("cards.bidAttachmentsTitle")}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
        {attachments_categories.map(({ key, label }) => (
          <div key={key}>
            <FileUploadWrapper
              form={form}
              name={key}
              label={label}
              dropZoneConfig={{
                accept: {
                  "application/pdf": [".pdf"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                },
                maxSize: 5 * 1024 * 1024, // 5MB
              }}
            />
          </div>
        ))}
      </div>
    </CustomCard>
  );
}

const BidSubmitButton = () => {
  const t = useTranslations("CreateBid");

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
      <Button
        variant="outline"
        type="button"
        size="lg"
        className="w-full sm:w-auto transition-all duration-300 hover:border-primary hover:bg-primary/5 focus:ring-2 focus:ring-primary/20"
      >
        {t("cards.buttons.cancel")}
      </Button>
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
      >
        {t("cards.buttons.publish")}
      </Button>
    </div>
  );
};

const BidDetailsCard = ({ form }: FormProps) => {
  const t = useTranslations("CreateBid");

  return (
    <CustomCard title={t("cards.bidDetailsTitle")}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t("cards.budget")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="120,000"
                    {...field}
                    className="mt-1.5 h-10 transition-all duration-300 bg-background/50 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1.5" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t("cards.dueDate")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <div className="mt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal transition-all duration-300",
                            !field.value && "text-muted-foreground",
                            "bg-background/50 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MM/dd/yyyy")
                          ) : (
                            <span>{t("cards.pickADate")}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage className="text-xs mt-1.5" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {t("cards.description")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("cards.descriptionPlaceholder")}
                  className="mt-1.5 min-h-[160px] transition-all duration-300 bg-background/50 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs mt-1.5" />
            </FormItem>
          )}
        />
      </div>
    </CustomCard>
  );
};

const CreateBid = ({ id }: { id: string }) => {
  const t = useTranslations("CreateBid");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: "",
      description: "",
      attachments: {
        technical: [],
        financial: [],
        administrative: [],
      },
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values for BidId: ", id, ", values: ", values);
  }

  return (
    <div className="bg-white">
      <div className="p-4 mx-auto">
        <div className="space-y-2 mb-6 sm:mb-8 lg:mb-10">
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              {t("title")}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8"
          >
            <BidDetailsCard form={form} />
            <AttachmentsCard form={form} />
            <BidSubmitButton />
          </form>
        </Form>
      </div>
    </div>
  );
};

const CreateBidPage = () => {
  const { id } = useParams();

  if (!id || Array.isArray(id)) {
    return <div>Loading...</div>;
  }

  return <CreateBid id={id} />;
};

export default CreateBidPage;
