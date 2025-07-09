"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/axios";
import { User } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";
import { Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

interface OperatorsTableProps {
  onDelete?: (id: number) => void;
  onInvite: (id: number) => void;
}

function useSearchOperators(email: string) {
  return useQuery({
    queryKey: ["searchOperators", email],
    queryFn: async (): Promise<User[]> => {
      if (!email) return [];

      const response = await apiClient.get<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/users/ocp/agents`, {
        params: {
          search: email,
        },
      });
      return response.data.users;
    },
    enabled: email.length > 0,
    retry: 1,
  });
}

type Operator = {
  id: number;
  full_name: string;
  title: string;
  email: string;
  added_at: Date;
};

export function OperatorsTable({ onDelete, onInvite }: OperatorsTableProps) {
  const [open, setOpen] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [email, setEmail] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [debouncedEmail] = useDebounce(email, 300);
  const { data: searchResults, isLoading } = useSearchOperators(debouncedEmail);

  const handleSubmit = () => {
    setOperators((prev) => {
      const newOperators = selectedUsers.map((user) => ({
        id: user.id,
        full_name: user.full_name ?? "",
        title: user.title ?? "",
        email: user.email ?? "",
        added_at: new Date(),
      }));
      return [...prev, ...newOperators];
    });

    selectedUsers.forEach((user) => {
      onInvite(user.id);
    });

    setEmail("");
    setSelectedUsers([]);
    setOpen(false);
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleDelete = (id: number) => {
    setOperators((prev) => prev.filter((operator) => operator.id !== id));

    onDelete?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Operators</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <UserPlus size={16} />
              Add Operator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-600">
                Invite Agents
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Agent Email..."
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedUsers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Invite ({selectedUsers.length})
                </Button>
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {user.email}
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {email && (
                <Command className="rounded-lg border shadow-md">
                  <CommandEmpty className="p-4 text-sm text-muted-foreground">
                    {isLoading ? "Searching..." : "No agent found."}
                  </CommandEmpty>
                  {searchResults && searchResults.length > 0 && (
                    <CommandGroup className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {searchResults.map((user) => (
                        <CommandItem
                          key={user.id}
                          className="flex items-center justify-between p-2"
                          onSelect={() => toggleUserSelection(user)}
                        >
                          <div>
                            <p className="font-medium">{user.first_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                          {selectedUsers.some((u) => u.id === user.id) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
                        <TableHead className="text-blue-500">Full Name</TableHead>
          <TableHead className="text-blue-500">Title</TableHead>
          <TableHead className="text-blue-500">Email</TableHead>
          <TableHead className="text-blue-500">Added At</TableHead>
          <TableHead className="text-blue-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map((operator) => (
              <TableRow key={operator.id}>
                <TableCell className="font-medium">
                  {operator.full_name}
                </TableCell>
                <TableCell>{operator.title}</TableCell>
                <TableCell>{operator.email}</TableCell>
                <TableCell>{operator.added_at?.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(operator.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
