"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomCard } from "@/components/ui/ocp/custom-card";
import FileUploadWrapper from "@/components/ui/ocp/form/common/FileUploadWrapper";
import FormFieldWrapper from "@/components/ui/ocp/form/common/FormFieldWrapper";
import FormSelectWrapper from "@/components/ui/ocp/form/common/FormSelectWrapper";
import { ViewAttachmentsCard } from "@/components/ui/ocp/purchase-request/view-attachments-card";
import { CompaniesTable } from "@/components/ui/ocp/tables/companies-table";
import { OperatorsTable } from "@/components/ui/ocp/tables/operators-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDepartments } from "@/endpoints/departments/get-departements";
import { useAttachments } from "@/endpoints/doc/get-attachements";
import {
  useCreateDraftPurchaseRequest,
  useCreatePurchaseRequest,
} from "@/endpoints/purchase-requests/purchase-requests";
import { Departement } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import * as z from "zod";

enum RequestType {
  CONSULTATION_PAR_DEVIS_CONTRADICTOIRE = "CONSULTATION_PAR_DEVIS_CONTRADICTOIRE",
  PETITS_ACHATS_INFERIEUR_A_5000 = "PETITS_ACHATS_INFERIEUR_A_5000",
  CONSULTATION_EN_GRE_A_GRE = "CONSULTATION_EN_GRE_A_GRE",
  CONTRACT_GROUPE = "CONTRACT_GROUPE",
  ACHAT_AFRIQUE = "ACHAT_AFRIQUE",
  APPEL_DOFFERS_OUVERT = "APPEL_DOFFERS_OUVERT",
  APPEL_DOFFERS_RESTRINGU = "APPEL_DOFFERS_RESTRINGU",
}

enum ItemType {
  MATERIALS = "MATERIALS",
  SERVICES = "SERVICES",
}

const mockERPReferences = {
  "ERP-001": {
    glAccount: "1234-5678",
    costObject: "COST-001",
    internalOrder: "IO-2024-001",
    wbsElement: "WBS-PROJ-001",
    description: "IT Equipment Purchase",
  },
  "ERP-002": {
    glAccount: "8765-4321",
    costObject: "COST-002",
    internalOrder: "IO-2024-002",
    wbsElement: "WBS-PROJ-002",
    description: "Office Supplies",
  },
};

const purchaseRequestSchema = z.object({
  requestTitle: z.string().min(1, "Title is required"),
  department: z.coerce.number().min(1, "Department is required"),
  deliveryDate: z.date(),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  itemType: z.nativeEnum(ItemType),
  settings: z.object({
    dueDate: z.date(),
    publishmentDate: z.date().optional(),
    requestType: z.nativeEnum(RequestType),
  }),
  erpReference: z.string().min(1, "ERP Reference is required"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        estimatedPrice: z.coerce.number().min(0, "Price cannot be negative"),
        currency: z.string().min(1, "Currency is required"),
        unit: z.string().min(1, "Unit is required"),
      })
    )
    .superRefine((items, ctx) => {
      const itemType = (ctx.path[0] as unknown as { itemType: ItemType })
        ?.itemType;
      if (itemType === ItemType.MATERIALS && (!items || items.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one item is required for material requests",
        });
        return false;
      }
      return true;
    }),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  operators: z.array(z.number()).optional(),
  companies: z.array(z.number()).optional(),
});

const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

type FormProps = {
  form: UseFormReturn<z.infer<typeof purchaseRequestSchema>>;
};

type ItemFormFieldsProps = FormProps & {
  index: number;
  onRemove: () => void;
  showRemoveButton: boolean;
};

type ItemsCardProps = FormProps & {
  items: Array<{
    description: string;
    quantity: number;
    estimatedPrice: number;
    currency: string;
    unit: string;
  }>;
  addItem: () => void;
  removeItem: (index: number) => void;
};

function RequestDetailsCard({ form }: FormProps) {
  const t = useTranslations("PurchaseRequest.Create");

  const { data: departments } = useDepartments();

  return (
    <motion.div {...ANIMATION_CONFIG} transition={{ delay: 0.1 }}>
      <CustomCard title={t("cards.requestDetails")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            form={form}
            name="requestTitle"
            label={t("fields.requestTitle")}
            placeholder={t("fields.requestTitle")}
            required
          />

          <FormSelectWrapper
            form={form}
            name="department"
            label={t("fields.department")}
            options={
              departments?.map((dept: Departement) => ({
                value: dept.id.toString(),
                label: dept.name,
              })) || []
            }
            required
          />

          <FormFieldWrapper
            form={form}
            name="deliveryDate"
            label={t("fields.deliveryDate")}
            inputComponent="date"
            required
          />

          <FormFieldWrapper
            form={form}
            name="deliveryAddress"
            label={t("fields.deliveryAddress")}
            placeholder={t("fields.deliveryAddress")}
            required
          />

          <FormSelectWrapper
            form={form}
            name="itemType"
            label={t("fields.itemType")}
            options={[
              { value: ItemType.MATERIALS, label: t("itemTypes.materials") },
              { value: ItemType.SERVICES, label: t("itemTypes.services") },
            ]}
            required
          />

          <FormSelectWrapper
            form={form}
            name="priority"
            label={t("fields.priority")}
            options={[
              { value: "Low", label: "Low" },
              { value: "Medium", label: "Medium" },
              { value: "High", label: "High" },
              { value: "Critical", label: "Critical" },
            ]}
            required
          />
        </div>
      </CustomCard>
    </motion.div>
  );
}

function PurchaseRequestSettingsCard({ form }: FormProps) {
  const t = useTranslations("PurchaseRequest.Create");

  return (
    <motion.div {...ANIMATION_CONFIG} transition={{ delay: 0.2 }}>
      <CustomCard title={t("cards.settings")}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormFieldWrapper
            form={form}
            name="settings.dueDate"
            label={t("fields.dueDate")}
            inputComponent="date"
            required
          />

          <FormFieldWrapper
            form={form}
            name="settings.publishmentDate"
            label={t("fields.publishmentDate")}
            inputComponent="date"
          />

          <FormSelectWrapper
            form={form}
            name="settings.requestType"
            label={t("fields.requestType")}
            options={Object.values(RequestType).map((type) => ({
              value: type,
              label: t(`requestTypes.${type}`),
            }))}
            required
          />
        </div>
      </CustomCard>
    </motion.div>
  );
}

function ERPDetailsCard({
  form,
  disableDataFetching = false,
}: FormProps & { disableDataFetching?: boolean }) {
  const t = useTranslations("PurchaseRequest.Create");
  const [showDetails, setShowDetails] = useState(false);
  const [showNoDetailsMessage, setShowNoDetailsMessage] = useState(false);
  const [erpDetails, setErpDetails] = useState<{
    glAccount: string;
    costObject: string;
    internalOrder: string;
    wbsElement: string;
  } | null>(null);

  const reference = useWatch({
    control: form.control,
    name: "erpReference",
  });

  useEffect(() => {
    if (disableDataFetching) return;

    const handleReferenceChange = (value: string) => {
      const erpData =
        mockERPReferences[value as keyof typeof mockERPReferences];

      if (erpData) {
        setErpDetails(erpData);
        setShowDetails(true);
        setShowNoDetailsMessage(false);
      } else {
        setErpDetails(null);
        setShowDetails(false);
        setShowNoDetailsMessage(value !== "");
      }
    };

    handleReferenceChange(reference);
  }, [reference, disableDataFetching]);

  return (
    <CustomCard title={t("cards.erpReference")}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <FormFieldWrapper
            form={form}
            name="erpReference"
            label={t("fields.erpReference")}
            placeholder={t("fields.erpReferencePlaceholder")}
            required
          />
          {!disableDataFetching && (
            <p className="text-sm text-gray-500">
              {t("fields.erpReferenceHelp")}
            </p>
          )}
        </div>

        {showNoDetailsMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200"
          >
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">{t("errors.invalidReference")}</p>
              <p className="text-sm">{t("errors.noErpDetails")}</p>
            </div>
          </motion.div>
        )}

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">
                {t("cards.erpDetails")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  {t("fields.glAccount")}
                </label>
                <p className="text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                  {erpDetails?.glAccount}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Cost Object
                </label>
                <p className="text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                  {erpDetails?.costObject}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Internal Order
                </label>
                <p className="text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                  {erpDetails?.internalOrder || "-"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  WBS Element
                </label>
                <p className="text-gray-900 bg-white px-3 py-2 rounded border border-gray-200">
                  {erpDetails?.wbsElement || "-"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </CustomCard>
  );
}

function ItemFormFields({
  form,
  index,
  onRemove,
  showRemoveButton,
}: ItemFormFieldsProps) {
  const t = useTranslations("PurchaseRequest.Create");
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded relative"
    >
      {showRemoveButton && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2"
          onClick={onRemove}
        >
          ×
        </Button>
      )}

      <FormFieldWrapper
        form={form}
        name={`items.${index}.description`}
        label={t("fields.description")}
        placeholder={t("fields.descriptionPlaceholder")}
        required
      />

      <FormFieldWrapper
        form={form}
        name={`items.${index}.quantity`}
        label={t("fields.quantity")}
        type="number"
        required
      />

      <FormFieldWrapper
        form={form}
        name={`items.${index}.estimatedPrice`}
        label={t("fields.estimatedPrice")}
        type="number"
        required
      />

      <FormFieldWrapper
        form={form}
        name={`items.${index}.currency`}
        label={t("fields.currency")}
        required
      />

      <FormFieldWrapper
        form={form}
        name={`items.${index}.unit`}
        label={t("fields.unit")}
        placeholder={t("fields.unitPlaceholder")}
        required
      />
    </motion.div>
  );
}

function ItemsCard({ form, items, addItem, removeItem }: ItemsCardProps) {
  const t = useTranslations("PurchaseRequest.Create");

  return (
    <CustomCard title={t("cards.items")}>
      <div className="space-y-4">
        {items.map((_, index) => (
          <ItemFormFields
            key={index}
            form={form}
            index={index}
            onRemove={() => removeItem(index)}
            showRemoveButton={items.length > 1}
          />
        ))}
        <div className="flex justify-end">
          <Button type="button" onClick={addItem} variant="outline">
            {t("buttons.addItem")}
          </Button>
        </div>
      </div>
    </CustomCard>
  );
}

function AdditionalInformationCard({ form }: FormProps) {
  const t = useTranslations("PurchaseRequest.Create");

  return (
    <CustomCard title={t("cards.additionalInfo")}>
      <FormFieldWrapper
        form={form}
        inputComponent="textarea"
        name="notes"
        label={t("fields.notes")}
        placeholder={t("fields.notesPlaceholder")}
      />
    </CustomCard>
  );
}

function AttachmentsCard({ form }: FormProps) {
  const t = useTranslations("PurchaseRequest.Create");

  return (
    <CustomCard title={t("cards.attachments")}>
      <FileUploadWrapper
        form={form}
        name="attachments"
        label={t("cards.attachments")}
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
    </CustomCard>
  );
}

function RequestDetailsSection({
  details,
}: {
  details: Array<{ label: string; value: unknown }>;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Request Details</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {details.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="font-medium">{String(value || "-")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemsSection({
  items,
}: {
  items?: Array<z.infer<typeof purchaseRequestSchema>["items"][0]>;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Items</h3>
      </div>
      <div className="p-4">
        {!items || items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No items added to this request
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Item {index + 1}
                  </span>
                </div>
                <p className="font-medium">{item.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Quantity: </span>
                    <span className="font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price: </span>
                    <span className="font-medium">
                      {item.estimatedPrice.toLocaleString()} {item.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmationActions({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("PurchaseRequest.Create");
  return (
    <div className="flex justify-end gap-4 pt-4 border-t">
      <Button variant="outline" onClick={onCancel} className="min-w-[100px]">
        {t("confirmation.cancel")}
      </Button>
      <Button onClick={onConfirm} className="bg-custom-green-500 min-w-[100px]">
        {t("confirmation.confirm")}
      </Button>
    </div>
  );
}

function ConfirmationSheet({
  isOpen,
  onOpenChange,
  formData,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: z.infer<typeof purchaseRequestSchema> | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("PurchaseRequest.Create");

  const { data: attachments = [] } = useAttachments(
    formData?.attachments,
    isOpen
  );

  const requestDetails = [
    { label: t("fields.requestTitle"), value: formData?.requestTitle },
    { label: t("fields.department"), value: formData?.department },
    { label: t("fields.priority"), value: formData?.priority },
    {
      label: t("fields.deliveryDate"),
      value:
        formData?.deliveryDate instanceof Date
          ? formData.deliveryDate.toLocaleDateString()
          : "-",
    },
    {
      label: t("fields.dueDate"),
      value:
        formData?.settings.dueDate instanceof Date
          ? formData.settings.dueDate.toLocaleDateString()
          : "-",
    },
    {
      label: t("fields.publishmentDate"),
      value:
        formData?.settings.publishmentDate instanceof Date
          ? formData.settings.publishmentDate.toLocaleDateString()
          : "-",
    },
    { label: t("fields.requestType"), value: formData?.settings.requestType },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-2xl">
            {t("confirmation.title")}
          </SheetTitle>
          <SheetDescription className="text-base">
            {t("confirmation.description")}
          </SheetDescription>
        </SheetHeader>

        <div className="container mx-auto max-w-5xl space-y-8">
          <RequestDetailsSection details={requestDetails} />
          {formData?.items && formData?.items.length > 0 && (
            <ItemsSection items={formData?.items} />
          )}

          {attachments.length > 0 && (
            <ViewAttachmentsCard
              title={t("cards.attachments")}
              attachments={attachments}
            />
          )}

          <ConfirmationActions onConfirm={onConfirm} onCancel={onCancel} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function CreatePurchaseRequestPage() {
  const t = useTranslations("PurchaseRequest.Create");

  const [items, setItems] = useState<
    {
      description: string;
      quantity: number;
      estimatedPrice: number;
      currency: string;
      unit: string;
    }[]
  >([]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<z.infer<
    typeof purchaseRequestSchema
  > | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof purchaseRequestSchema>>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      priority: "Low",
      settings: {
        requestType: RequestType.APPEL_DOFFERS_OUVERT,
      },
    },
  });

  const createMutation = useCreatePurchaseRequest();
  const createDraftMutation = useCreateDraftPurchaseRequest();

  const [selectedOperators, setSelectedOperators] = useState<number[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        estimatedPrice: 0,
        unit: "pcs",
        currency: "MAD",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items?.filter((_, i) => i !== index));
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data: z.infer<typeof purchaseRequestSchema>) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (!formData) return;
      setIsSubmitting(true);
      await createMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      const formValues = form.getValues();
      await createDraftMutation.mutateAsync(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemType = useWatch({
    control: form.control,
    name: "itemType",
  });

  useEffect(() => {
    setItems([]);
    form.setValue("items", []);
  }, [itemType, form]);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            <RequestDetailsCard form={form} />
            <PurchaseRequestSettingsCard form={form} />
            <ERPDetailsCard form={form} disableDataFetching={true} />

            {itemType === ItemType.MATERIALS && (
              <ItemsCard
                form={form}
                items={items}
                addItem={addItem}
                removeItem={removeItem}
              />
            )}

            <AdditionalInformationCard form={form} />
            <AttachmentsCard form={form} />
            <div className="space-y-4">
              <OperatorsTable
                onDelete={(id: number) => {
                  const newOperators = selectedOperators.filter(
                    (opId) => opId !== id
                  );
                  setSelectedOperators(newOperators);
                  form.setValue("operators", newOperators);
                }}
                onInvite={(id: number) => {
                  if (!selectedOperators.includes(id)) {
                    const newOperators = [...selectedOperators, id];
                    setSelectedOperators(newOperators);
                    form.setValue("operators", newOperators);
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <CompaniesTable
                onDelete={(id: number) => {
                  const newCompanies = selectedCompanies.filter(
                    (compId) => compId !== id
                  );
                  setSelectedCompanies(newCompanies);
                  form.setValue("companies", newCompanies);
                }}
                onAdd={(id: number) => {
                  if (!selectedCompanies.includes(id)) {
                    const newCompanies = [...selectedCompanies, id];
                    setSelectedCompanies(newCompanies);
                    form.setValue("companies", newCompanies);
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("saving") : t("saveAsDraft")}
              </Button>
              <Button
                type="submit"
                className="bg-custom-green-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("submitting") : t("submitRequest")}
              </Button>
            </div>
          </motion.div>
        </form>
      </Form>

      <ConfirmationSheet
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        formData={formData}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
