import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

function CollapWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
      defaultOpen
      className="overflow-hidden border p-4 rounded-lg"
    >
      <CollapsibleTrigger className="w-full flex justify-between items-center cursor-pointer text-zinc-600 hover:text-zinc-900">
        <h1 className="text-lg 2xl:text-xl">{title}</h1>
        <ChevronDown
          className={cn("transition-all duration-300", isOpen && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("mt-4 transition-all duration-300 CollapsibleContent")}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default CollapWrapper;
