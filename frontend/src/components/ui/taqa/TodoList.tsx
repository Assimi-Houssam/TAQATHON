"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrashIcon,
  ChevronDownIcon,
  PlusCircle,
  CheckCircle2,
  Circle,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useGetUserTasks } from "@/endpoints/tasks/get-user-tasks";
import { Task } from "@/types/entities";
import {
  useDeleteTask,
  useToggleTaskCompletion,
  useCreateTask,
  type CreateTaskDto,
} from "@/endpoints/tasks/tasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type CreateTaskForm = Omit<CreateTaskDto, "userId">;

const TaskItem = ({
  task,
  date,
  isExpanded,
  onToggle,
  onDelete,
  onToggleComplete,
}: {
  task: Task;
  date: Date;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (taskId: number) => void;
  onToggleComplete: (taskId: number) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "group relative bg-white/50 rounded-lg border border-gray-100/80 transition-all duration-200",
      "hover:border-gray-200/80 hover:shadow-sm"
    )}
  >
    <div className="p-3">
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleComplete(task.id)}
                      className="mt-1 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3
                className={cn(
                  "font-medium text-gray-900 truncate max-w-[280px]",
                  task.completed && "line-through text-gray-500"
                )}
              >
                {task.title}
              </h3>
              <span className="text-sm text-gray-500 mt-0.5 block">
                {date.getDate()}{" "}
                {date.toLocaleString("default", { month: "short" })} -{" "}
                {date.getHours().toString().padStart(2, "0")}:
                {date.getMinutes().toString().padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onToggle}
                className={cn(
                  "p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors",
                  isExpanded && "bg-gray-100/80"
                )}
              >
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "transform rotate-180"
                  )}
                />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50/50 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {isExpanded && task.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 text-sm text-gray-600 bg-gray-50/80 rounded-lg p-3"
              >
                {task.description}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </motion.div>
);

const CreateTaskDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const t = useTranslations("dashboard");
  const createTask = useCreateTask();
  const [open, setOpen] = useState(false);
  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateTaskForm) => {
    createTask.mutate(
      {
        title: data.title,
        description: data.description,
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about your task..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createTask.isPending}
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewTaskButton = () => {
  const t = useTranslations("dashboard");

  return (
    <CreateTaskDialog
      trigger={
        <Button
          className={cn(
            "gap-2",
            "bg-blue-500 hover:bg-blue-600",
            "text-white font-medium",
            "transition-all duration-200"
          )}
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Task
        </Button>
      }
    />
  );
};

export const TodoList = ({ className }: { className?: string }) => {
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const { data: tasksData, isLoading: isLoadingTasks } = useGetUserTasks(page);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const deleteTask = useDeleteTask();
  const toggleCompletion = useToggleTaskCompletion();
  const t = useTranslations("dashboard");

  useEffect(() => {
    if (tasksData?.data) {
      setAllTasks((prev) => {
        const newTasks = tasksData.data.filter(
          (newTask) =>
            !prev.some((existingTask) => existingTask.id === newTask.id)
        );
        return [...prev, ...newTasks];
      });
    }
  }, [tasksData?.data]);

  const handleDeleteTask = (taskId: number) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
        setExpandedTasks((prev) =>
          prev.filter((index) => allTasks[index]?.id !== taskId)
        );
      },
    });
  };

  const handleToggleComplete = (taskId: number) => {
    const taskToUpdate = allTasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    // Optimistically update the task's completed status
    setAllTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    toggleCompletion.mutate(taskId, {
      onError: () => {
        // Revert the optimistic update if the mutation fails
        setAllTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, completed: taskToUpdate.completed }
              : task
          )
        );
      },
    });
  };

  const toggleTask = (index: number) => {
    setExpandedTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (isLoadingTasks && !allTasks.length) {
    return (
      <Card className={cn("bg-white/90 backdrop-blur-xl", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!allTasks.length) {
    return (
      <Card className={cn("bg-white/90 backdrop-blur-xl", className)}>
        <CardContent className="p-12 text-center flex flex-col items-center justify-center h-full">
          <div className="rounded-full bg-gray-50 p-6 mb-6">
            <ClipboardList className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm">
            Start organizing your work by creating your first task. Click the
            button below to get started.
          </p>
          <CreateTaskDialog
            trigger={
              <Button
                className={cn(
                  "gap-2 p-2 px-4 h-auto text-base shadow-lg",
                  "bg-blue-500 hover:bg-blue-600",
                  "text-white font-medium",
                  "transition-all duration-200 hover:scale-105"
                )}
              >
                <PlusCircle className="h-5 w-5" />
                Add New Task
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  const sortTasksByDateAndCompletion = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (a.completed === b.completed) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return a.completed ? 1 : -1;
    });
  };

  const showLoadMore = tasksData && tasksData.page < tasksData.totalPages;
  const isLoadingMore = isLoadingTasks && allTasks.length > 0;

  return (
    <Card className={cn("bg-white/90 backdrop-blur-xl", className)}>
      <CardContent className="p-0 pt-6">
        <div className="space-y-4">
          <AnimatePresence>
            {sortTasksByDateAndCompletion(allTasks).map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                date={new Date(task.createdAt)}
                isExpanded={expandedTasks.includes(index)}
                onToggle={() => toggleTask(index)}
                onDelete={() => handleDeleteTask(task.id)}
                onToggleComplete={() => handleToggleComplete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {showLoadMore && (
          <Button
            variant="outline"
            className="w-full mt-4 text-gray-500 hover:text-gray-700"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Load More
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
