import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FolderDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Document {
  type: string;
  title: string;
  description: string;
}

function DownloadButton() {
  return (
    <Button size={"sm"} className="bg-custom-green-500">
      <FolderDown className="" />
      <h1>Download</h1>
    </Button>
  );
}

const documents: Document[] = [
  {
    type: "Type",
    title: "Title",
    description: "Description",
  },
  {
    type: "Type",
    title: "Title",
    description: "Description",
  },
  {
    type: "Type",
    title: "Title",
    description: "Description",
  },
  {
    type: "Type",
    title: "Title",
    description: "Description",
  },
  {
    type: "Type",
    title: "Title",
    description: "Description",
  },
];

export function DocumentsTable() {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead className="">Type</TableHead>
              <TableHead className="">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document, index) => (
              <TableRow className="hover:bg-transparent" key={index}>
                <TableCell className="text-gray-600">{document.type}</TableCell>
                <TableCell className="text-gray-600">
                  {document.title}
                </TableCell>
                <TableCell className="text-gray-600">
                  {document.description}
                </TableCell>
                <TableCell className="text-right">
                  <DownloadButton />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
