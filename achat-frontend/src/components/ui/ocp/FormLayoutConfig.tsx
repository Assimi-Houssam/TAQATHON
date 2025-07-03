import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteFormField } from "@/endpoints/forms/useFormMutations";
import { FormField } from "@/types/entities";
import { LayoutConfig } from "@/types/forms-controller";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { MoreHorizontalIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface FormFieldGroup {
  id: string;
  title: string;
  columns: number;
  spacing: number;
  formFields: FormField[];
}

export interface GroupedFormFieldLayout {
  groups: FormFieldGroup[];
}

const COLUMN_OPTIONS = [1, 2, 3, 4] as const;
const SPACING_OPTIONS = [2, 4, 6, 8] as const;

export const getColSpan = (columns: number) => {
  const colSpanMap = {
    1: "col-span-12",
    2: "col-span-12 md:col-span-6",
    3: "col-span-12 md:col-span-4",
    4: "col-span-12 md:col-span-3",
  };
  return (
    colSpanMap[columns as keyof typeof colSpanMap] ??
    "col-span-12 md:col-span-6"
  );
};

const GroupControls = ({
  group,
  onUpdate,
  onDelete,
  showDelete,
}: {
  group: FormFieldGroup;
  onUpdate: (updates: Partial<FormFieldGroup>) => void;
  onDelete: () => void;
  showDelete: boolean;
}) => (
  <div className="flex gap-4 items-center">
    <Input
      value={group.title}
      onChange={(e) => onUpdate({ title: e.target.value })}
      className="max-w-xs"
    />
    {["columns", "spacing"].map((setting) => (
      <Select
        key={setting}
        value={group[
          setting as keyof Pick<FormFieldGroup, "columns" | "spacing">
        ].toString()}
        onValueChange={(value) => onUpdate({ [setting]: parseInt(value) })}
      >
        <SelectTrigger className="w-32">
          <SelectValue
            placeholder={setting.charAt(0).toUpperCase() + setting.slice(1)}
          />
        </SelectTrigger>
        <SelectContent>
          {(setting === "columns" ? COLUMN_OPTIONS : SPACING_OPTIONS).map(
            (num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
                {setting === "columns"
                  ? num === 1
                    ? " Column"
                    : " Columns"
                  : "px"}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    ))}
    {showDelete && (
      <Button variant="destructive" size="sm" onClick={onDelete}>
        Delete Group
      </Button>
    )}
  </div>
);

const SortableFormField = ({
  formField,
  columns,
  onMoveToGroup,
  onDelete,
  isFirstGroup,
  isLastGroup,
}: {
  formField: FormField;
  columns: number;
  onMoveToGroup: (formFieldId: string, direction: "up" | "down") => void;
  onDelete: (formFieldId: string) => void;
  isFirstGroup: boolean;
  isLastGroup: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: formField.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`${getColSpan(columns)} p-4 border rounded-lg relative ${
        isDragging ? "opacity-50 bg-accent" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div {...listeners} className="flex-1 cursor-move">
          <h4 className="font-medium mb-2">{formField.label}</h4>
          <p className="text-sm text-muted-foreground">
            Type: {formField.type}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isFirstGroup && (
              <DropdownMenuItem
                onClick={() => onMoveToGroup(formField.id.toString(), "up")}
              >
                <ChevronUpIcon className="h-4 w-4 mr-2" />
                Move to group above
              </DropdownMenuItem>
            )}
            {!isLastGroup && (
              <DropdownMenuItem
                onClick={() => onMoveToGroup(formField.id.toString(), "down")}
              >
                <ChevronDownIcon className="h-4 w-4 mr-2" />
                Move to group below
              </DropdownMenuItem>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete formfield
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Formfield</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this formfield? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(formField.id.toString())}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export interface FormLayoutConfigProps {
  formFields: FormField[];
  onSave: (layout: LayoutConfig) => void;
  onCancel: () => void;
  initialLayout?: LayoutConfig | null;
}

export function FormLayoutConfig({
  formFields,
  onSave,
  onCancel,
  initialLayout,
}: FormLayoutConfigProps) {
  const [layout, setLayout] = useState<GroupedFormFieldLayout>(() => ({
    groups: [
      {
        id: "group-1",
        title: "Group 1",
        columns: 2,
        spacing: 4,
        formFields: formFields,
      },
    ],
  }));

  const [groupCounter, setGroupCounter] = useState(() => {
    if (initialLayout) {
      // Find the highest group number from the group IDs
      const highestNumber = Math.max(
        ...(initialLayout.groups ?? [])
          .map((g) => parseInt(g.id.replace("group-", "")))
          .filter((n) => !isNaN(n))
      );
      return highestNumber;
    }
    return 1;
  });

  useEffect(() => {
    if (initialLayout) {
      setLayout({
        groups: (initialLayout.groups ?? []).map((group) => ({
          ...group,
          formFields: group.formfieldIds
            .map((id) => formFields.find((q) => q.id === id))
            .filter((q): q is FormField => q !== undefined),
        })),
      });
    } else {
      setLayout({
        groups: [
          {
            id: "group-1",
            title: "Group 1",
            columns: 2,
            spacing: 4,
            formFields: formFields,
          },
        ],
      });
    }
  }, [initialLayout, formFields]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayout((currentLayout) => {
        const newGroups = currentLayout.groups.map((group) => {
          const oldIndex = group.formFields.findIndex(
            (item) => item.id === active.id
          );
          const newIndex = group.formFields.findIndex(
            (item) => item.id === over.id
          );

          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...group,
              formFields: arrayMove(group.formFields, oldIndex, newIndex),
            };
          }
          return group;
        });

        return {
          ...currentLayout,
          groups: newGroups,
        };
      });
    }
  };

  const addGroup = () => {
    setGroupCounter((prev) => prev + 1);
    setLayout((current) => ({
      ...current,
      groups: [
        ...current.groups,
        {
          id: `group-${groupCounter + 1}`,
          title: `Group ${groupCounter + 1}`,
          columns: 2,
          spacing: 4,
          formFields: [],
        },
      ],
    }));
  };

  const updateGroup = (groupId: string, updates: Partial<FormFieldGroup>) => {
    setLayout((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));
  };

  const deleteGroup = (groupId: string) => {
    setLayout((current) => ({
      ...current,
      groups: current.groups.filter((group) => group.id !== groupId),
    }));
  };

  const moveFormFieldToGroup = useCallback(
    (formFieldId: string, direction: "up" | "down") => {
      setLayout((current) => {
        // Early return check to prevent unnecessary updates
        const currentGroups = current.groups;
        let sourceGroupIndex = -1;
        let formFieldIndex = -1;

        // Find the formfield and its group
        for (let i = 0; i < currentGroups.length; i++) {
          const qIndex = currentGroups[i].formFields.findIndex(
            (q) => q.id.toString() === formFieldId
          );
          if (qIndex !== -1) {
            sourceGroupIndex = i;
            formFieldIndex = qIndex;
            break;
          }
        }

        // If we didn't find the formfield or if we're at the boundaries, return unchanged
        if (
          sourceGroupIndex === -1 ||
          (direction === "up" && sourceGroupIndex === 0) ||
          (direction === "down" &&
            sourceGroupIndex === currentGroups.length - 1)
        ) {
          return current;
        }

        const targetGroupIndex =
          direction === "up" ? sourceGroupIndex - 1 : sourceGroupIndex + 1;

        // Create new groups array with the moved formfield
        const newGroups = [...currentGroups];
        const formFieldToMove = {
          ...currentGroups[sourceGroupIndex].formFields[formFieldIndex],
        };

        // Remove from source group
        newGroups[sourceGroupIndex] = {
          ...newGroups[sourceGroupIndex],
          formFields: newGroups[sourceGroupIndex].formFields.filter(
            (_, index) => index !== formFieldIndex
          ),
        };

        // Add to target group
        newGroups[targetGroupIndex] = {
          ...newGroups[targetGroupIndex],
          formFields: [
            ...newGroups[targetGroupIndex].formFields,
            formFieldToMove,
          ],
        };

        // Only update if the groups have actually changed
        if (JSON.stringify(newGroups) === JSON.stringify(currentGroups)) {
          return current;
        }

        return {
          ...current,
          groups: newGroups,
        };
      });
    },
    [] // Empty dependency array since we're using the callback form of setState
  );

  const deleteFormFieldMutation = useDeleteFormField();

  const deleteFormField = useCallback(
    async (formFieldId: string) => {
      try {
        await deleteFormFieldMutation.mutateAsync(formFieldId);
        setLayout((current) => ({
          ...current,
          groups: current.groups.map((group) => ({
            ...group,
            formFields: group.formFields.filter(
              (q) => q.id.toString() !== formFieldId
            ),
          })),
        }));
      } catch (error) {
        console.error("Failed to delete form field:", error);
      }
    },
    [deleteFormFieldMutation]
  );

  return (
    <div className="space-y-8">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={layout.groups.flatMap((g) => g.formFields.map((q) => q.id))}
        >
          {layout.groups.map((group, index) => (
            <div key={group.id} className="space-y-4 p-4 border rounded-lg">
              <GroupControls
                group={group}
                onUpdate={(updates) => updateGroup(group.id, updates)}
                onDelete={() => deleteGroup(group.id)}
                showDelete={layout.groups.length > 1}
              />

              <div
                className="grid grid-cols-12"
                style={{
                  gap: `${group.spacing * 4}px`,
                }}
              >
                {group.formFields.map((formField) => (
                  <SortableFormField
                    key={formField.id}
                    formField={formField}
                    columns={group.columns}
                    onMoveToGroup={moveFormFieldToGroup}
                    onDelete={deleteFormField}
                    isFirstGroup={index === 0}
                    isLastGroup={index === layout.groups.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex justify-between items-center">
        <div className="flex justify-end items-center">
          <Button onClick={addGroup}>Add Group</Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                groups: layout.groups.map((group) => ({
                  id: group.id,
                  title: group.title,
                  columns: group.columns,
                  spacing: group.spacing,
                  formfieldIds: group.formFields.map((q) => q.id),
                })),
              })
            }
          >
            Save Layout
          </Button>
        </div>
      </div>
    </div>
  );
}
