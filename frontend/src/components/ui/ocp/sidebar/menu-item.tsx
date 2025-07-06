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
      <SidebarMenuButton className="flex items-center gap-3 h-14 px-4">
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{title}</span>
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
      className={clsx(
        "h-14 mb-1 transition-all duration-200 border-l-4",
        isActive
          ? "bg-slate-900 text-white font-semibold border-l-blue-400"
          : "text-black hover:bg-slate-50 hover:text-slate-900 border-l-transparent hover:border-l-slate-200"
      )}
    >
      <Link
        href={url}
        className={clsx(
          "flex items-center gap-4 px-6 py-4 w-full justify-between h-full",
          isActive &&
            "hover:bg-slate-800 hover:text-white active:bg-slate-800 active:text-white"
        )}
        target={external ? "_blank" : undefined}
      >
        <div className="flex items-center gap-4">
          <Icon className="size-5 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {showAlertCount && (
            <Badge variant="destructive" className="text-xs px-2 py-1">
              {alertCount}
            </Badge>
          )}
          {hasSubItems && (
            <ChevronDown
              className={clsx(
                "size-4 transition-transform duration-200 flex-shrink-0",
                isActive ? "rotate-180" : ""
              )}
            />
          )}
        </div>
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
      className="ml-8 relative"
    >
      <div
        className="absolute left-0 w-[1px] bg-slate-300"
        style={{
          top: "0.5rem",
          height: `calc(100% - 1rem)`,
        }}
      ></div>

      <div className="space-y-1 w-full pt-2">
        {items.map((subItem) => (
          <SidebarMenuItem className="ml-4" key={subItem.title}>
            <SidebarMenuButton
              className="text-slate-600 hover:text-black hover:bg-slate-50 w-full transition-all duration-200 h-12"
              asChild
            >
              <Link
                href={subItem.url}
                target={external ? "_blank" : undefined}
                className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200 h-full"
              >
                <span className="text-sm font-medium tracking-wide">{subItem.title}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </div>
    </div>
  );
};
