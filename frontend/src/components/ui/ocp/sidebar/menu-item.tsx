import { Badge } from "@/components/ui/badge";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { MenuItemProps } from "@/types/sidebar";
import clsx from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubItem {
  title: string;
  url: string;
  parent?: string;
}

export function MenuItem({
  title,
  icon: Icon,
  url,
  external,
  alertCount,
  isActive,
  onClick,
  hasSubItems,
}: MenuItemProps) {
  if (!url) {
    return (
      <SidebarMenuButton className="flex items-center gap-2">
        <Icon className="h-4 w-4 p-5" />
        <span>{title}</span>
      </SidebarMenuButton>
    );
  }

  const showAlertCount = alertCount !== undefined && alertCount > 0;

  return (
    <SidebarMenuButton
      asChild
      onClick={() => {
        onClick();
      }}
      className={` ${
        isActive
          ? "bg-blue-400 text-white font-bold"
          : "hover:bg-zinc-100 hover:text-black"
      }`}
    >
      <Link
        href={url}
        className={clsx(
          "flex items-center gap-2 p-5 w-full justify-between",
          isActive &&
            "hover:bg-blue-400 hover:text-white active:bg-blue-600 active:text-white"
        )}
        target={external ? "_blank" : undefined}
      >
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <span className="flex-1">{title}</span>
        </div>
        {showAlertCount && (
          <Badge variant="destructive" className="ml-2">
            {alertCount}
          </Badge>
        )}
        {hasSubItems && (
          <ChevronDown
            className={`${
              isActive ? "rotate-180" : ""
            } transition-all duration-300`}
          />
        )}
      </Link>
    </SidebarMenuButton>
  );
}

interface SubMenuProps {
  items: SubItem[];
  contentRef: (element: HTMLDivElement | null) => void;
  height: string;
  external?: boolean;
}

export const SubMenu: React.FC<SubMenuProps> = ({
  items,
  contentRef,
  height,
  external,
}) => {
  return (
    <div
      ref={contentRef}
      style={{
        height: height,
        transition: "height 0.3s ease-out",
        overflow: "hidden",
      }}
      className="ml-6 relative"
    >
      <div
                    className="absolute left-0 w-[2px] bg-blue-400"
        style={{
          top: "1.25rem",
          height: `calc(100% - 2.9rem)`,
        }}
      ></div>

      <div ref={contentRef} className="space-y-1 w-full">
        {items.map((subItem) => (
          <SidebarMenuItem className="ml-3" key={subItem.title}>
            <SidebarMenuButton
              className="my-2 text-gray-600 hover:text-black hover:bg-transparent w-full transition-all duration-200"
              asChild
            >
              <Link
                href={subItem.url}
                target={external ? "_blank" : undefined}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:underline transition-all duration-300 menuItem"
              >
                <span>{subItem.title}</span>
                <ChevronRight className="w-2" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </div>
  );
};
