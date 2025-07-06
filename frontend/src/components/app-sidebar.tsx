"use client";

import sidebarItemsData from "@/components/static/sidebar_items.json" assert { type: "SidebarItemData" };
import Logo from "@/components/ui/ocp/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/user-context";

import { SidebarItem, SidebarTranslationKey } from "@/types/sidebar";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LucideIcon,
  Settings,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MenuItem, SubMenu } from "./ui/ocp/sidebar/menu-item";

// Add a map of icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  FileText,
  TrendingUp,
  Activity,
  Zap,
};

export function AppSidebar() {
  const [current, setCurrent] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<string[]>([]);
  const { isMobile } = useSidebar();
  const router = useRouter();

  const { user, isLoading: userLoading } = useUser();

  const t = useTranslations("sidebar");
  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      sidebarItemsData.items
        .filter((item) =>
          item.allowedEntityTypes?.includes(user?.entity_type as string)
        )
        .map((item) => ({
          title: t(item.titleKey as SidebarTranslationKey),
          icon: iconMap[item.icon] || FileText,
          url: item.url,
          alertCount: 'alertCount' in item ? (item.alertCount as number) : undefined,
          subItems: item.subItems
            ?.filter((subItem) =>
              subItem.allowedEntityTypes?.includes(user?.entity_type as string)
            )
            .map((subItem) => ({
              title: t(subItem.titleKey as SidebarTranslationKey),
              url: subItem.url,
              parent: subItem.parent,
            })),
        })),
    [t, user?.entity_type]
  );

  // Initialize the refs and heights arrays when sidebarItems changes
  useEffect(() => {
    contentRefs.current = Array(sidebarItems.length).fill(null);
    setHeights(Array(sidebarItems.length).fill("0px"));
    setIsLoading(false);
  }, [sidebarItems]);

  // Update isLoading to consider userLoading
  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
  }, [userLoading]);



  const handleOpen = (index: number) => {
    // If clicking the current tab while it's already open, do nothing
    if (index === current && open) {
      return;
    }

    if (index === current) {
      setOpen(!open);
      setHeights((prev) =>
        prev.map((h, i) =>
          i === index
            ? !open
              ? `${contentRefs.current[index]?.scrollHeight || 0}px`
              : "0px"
            : "0px"
        )
      );
    } else {
      // Close previous menu before opening new one
      setHeights((prev) =>
        prev.map((_, i) =>
          i === index
            ? `${contentRefs.current[index]?.scrollHeight || 0}px`
            : "0px"
        )
      );
      setCurrent(index);
      setOpen(true);
    }
  };

  // Modify the useEffect for path matching
  useEffect(() => {
    const path = window.location.pathname.slice(3);
    const index = sidebarItems.findIndex((item) => {
      const exactMatch = item.url === path;
      const subItemMatch = item.subItems?.some((sub) => sub.url === path);
      return exactMatch || subItemMatch;
    });

    if (index !== -1) {
      setCurrent(index);
      setOpen(true);
      // Update height for matched item with a slight delay for smooth animation
      requestAnimationFrame(() => {
        setHeights((prev) =>
          prev.map((_, i) =>
            i === index
              ? `${contentRefs.current[index]?.scrollHeight || 0}px`
              : "0px"
          )
        );
      });
    }
  }, [sidebarItems]);

  return (
    <Sidebar>
      <SidebarHeader className="bg-white md:h-24 flex items-center justify-center">
        <div
          className={`transition-opacity duration-300 w-full ${
            isLoading || userLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="md:p-6 p-2">
            <Logo />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white flex flex-col justify-between h-full">
        <SidebarGroup className="bg-white">
          <SidebarGroupContent>
            <SidebarMenu
              className={`px-4 py-2 transition-opacity duration-300 ${
                isLoading || userLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              {sidebarItems.map((item, index) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <MenuItem
                      {...item}
                      hasSubItems={!!item.subItems}
                      isCurrent={current === index}
                      isActive={current === index && open}
                      onClick={() => {
                        handleOpen(index);
                        if (isMobile) {
                          // toggleSidebar();
                        }
                      }}
                    />
                  </SidebarMenuItem>

                  {item.subItems && (
                    <SubMenu
                      items={item.subItems}
                      contentRef={(el) => (contentRefs.current[index] = el)}
                      height={heights[index]}
                      external={item.external}
                    />
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto border-t border-slate-200">
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center gap-4 w-full px-6 py-4 h-14 text-black hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 font-medium border-l-4 border-l-transparent hover:border-l-slate-200"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium tracking-wide">{t("pages.settings")}</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
