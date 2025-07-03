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
import { Company } from "@/types/entities";
import { useQuery } from "@tanstack/react-query";
import { Building2Icon, Eye, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

interface CompaniesTableProps {
  onDelete?: (id: number) => void;
  onAdd: (id: number) => void;
}

function useSearchCompanies(search: string) {
  return useQuery({
    queryKey: ["searchCompanies", search],
    queryFn: async (): Promise<Company[]> => {
      if (!search) return [];

      const response = await apiClient.get<{
        companies: Company[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/companies`, {
        params: { search },
      });
      return response.data.companies;
    },
    enabled: search.length > 0,
    retry: 1,
  });
}

export function CompaniesTable({ onDelete, onAdd }: CompaniesTableProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [debouncedSearch] = useDebounce(search, 300);
  const { data: searchResults, isLoading } =
    useSearchCompanies(debouncedSearch);

  const handleSubmit = () => {
    setCompanies((prev) => [...prev, ...selectedCompanies]);
    selectedCompanies.forEach((company) => {
      onAdd(company.id);
    });
    setSearch("");
    setSelectedCompanies([]);
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));

    onDelete?.(id);
  };

  const handleView = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.preventDefault();
    window.open(`/dashboard/companies/${id}`, "_blank");
  };

  const toggleCompanySelection = (company: Company) => {
    setSelectedCompanies((prev) => {
      const isSelected = prev.some((c) => c.id === company.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== company.id);
      }
      return [...prev, company];
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Companies</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Building2Icon size={16} />
              Invite Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-600">
                Invite Companies
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedCompanies.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add ({selectedCompanies.length})
                </Button>
              </div>

              {selectedCompanies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {company.legal_name} | {company.legal_form}
                      <button
                        onClick={() => toggleCompanySelection(company)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {search && (
                <Command className="rounded-lg border shadow-md">
                  <CommandEmpty className="p-4 text-sm text-muted-foreground">
                    {isLoading ? "Searching..." : "No company found."}
                  </CommandEmpty>
                  {searchResults && searchResults.length > 0 && (
                    <CommandGroup className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {searchResults.map((company) => (
                        <CommandItem
                          key={company.id}
                          className="flex items-center justify-between p-2"
                          onSelect={() => toggleCompanySelection(company)}
                        >
                          <div>
                            <p className="font-medium">{company.legal_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {company.legal_form}
                            </p>
                          </div>
                          {selectedCompanies.some(
                            (c) => c.id === company.id
                          ) && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
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
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="text-custom-green-500">
                Company Name
              </TableHead>
              <TableHead className="text-custom-green-500">
                Fields of work
              </TableHead>
              <TableHead className="text-custom-green-500">Phone</TableHead>
              <TableHead className="text-custom-green-500">Email</TableHead>
              <TableHead className="text-custom-green-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  {company.legal_name}
                </TableCell>
                <TableCell>{company.business_scopes?.join(", ")}</TableCell>
                <TableCell>{company.company_phone}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleView(e, company.id)}
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(company.id)}
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
