"use client";

import sidebarItemsData from "@/components/static/sidebar_items.json" assert { type: "SidebarItemData" };
import Logo from "@/components/ui/taqa/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

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
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, Component, useCallback, memo } from "react";
import { MenuItem, SubMenu } from "./ui/taqa/sidebar/menu-item";

// Add a map of icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  FileText,
  TrendingUp,
  Activity,
  Zap,
  Wrench,
};

// Simple Error Boundary for sidebar components
class SidebarErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Sidebar component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <SidebarMenuItem>
          <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
            Unable to load menu item
          </div>
        </SidebarMenuItem>
      );
    }

    return this.props.children;
  }
}

export function AppSidebar() {
  const [current, setCurrent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations("sidebar");
  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      sidebarItemsData.items
        .map((item) => ({
          title: t(item.titleKey as SidebarTranslationKey),
          icon: iconMap[item.icon] || FileText,
          url: item.url,
          alertCount: 'alertCount' in item ? (item.alertCount as number) : undefined,
          subItems: item.subItems
            ?.map((subItem) => ({
              title: t(subItem.titleKey as SidebarTranslationKey),
              url: subItem.url,
              parent: subItem.parent,
            })),
        })),
    [t]
  );

  // Initialize the refs when sidebarItems changes
  useEffect(() => {
    if (sidebarItems && Array.isArray(sidebarItems)) {
      const length = Math.max(0, sidebarItems.length);
      contentRefs.current = Array(length).fill(null);
    } else {
      contentRefs.current = [];
    }
    setIsLoading(false);
  }, [sidebarItems]);

  // Path matching logic to determine which tab is active
  useEffect(() => {
    try {
      if (!sidebarItems || !Array.isArray(sidebarItems) || sidebarItems.length === 0) {
        return;
      }

      const path = pathname?.slice(3) || '';
      
      // Find which main item should be active based on current path
      const activeIndex = sidebarItems.findIndex((item) => {
        if (!item) return false;
        
        // Check exact match with main item URL
        if (item.url === path) return true;
        
        // Check if any sub-item matches the current path
        if (item.subItems) {
          return item.subItems.some((sub) => sub?.url === path);
        }
        
        return false;
      });

      setCurrent(activeIndex !== -1 ? activeIndex : null);
    } catch (error) {
      console.warn('Error in path matching:', error);
    }
  }, [sidebarItems, pathname]);

  // Update isLoading when component is ready
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Simple click handler - no toggling, just navigation
  const handleItemClick = useCallback(() => {
    if (isMobile) {
      // toggleSidebar();
    }
  }, [isMobile]);

  // Safe render function for loading skeletons
  const renderLoadingSkeletons = useCallback(() => {
    const skeletonCount = 6;
    return Array.from({ length: skeletonCount }, (_, index) => (
      <SidebarMenuItem key={`skeleton-${index}`}>
        <SidebarMenuSkeleton showIcon index={index} className="h-14 my-1" />
      </SidebarMenuItem>
    ));
  }, []);

  // Safe render function for menu items
  const renderMenuItems = useCallback(() => {
    if (isLoading) {
      return renderLoadingSkeletons();
    }

    if (!sidebarItems || sidebarItems.length === 0) {
      return (
        <SidebarMenuItem>
          <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
            No menu items available
          </div>
        </SidebarMenuItem>
      );
    }

    return sidebarItems.map((item, index) => (
      <SidebarErrorBoundary key={item.title || `item-${index}`}>
        <div>
          <SidebarMenuItem>
            <MenuItem
              {...item}
              hasSubItems={!!item.subItems}
              isCurrent={current === index}
              isActive={current === index}
              onClick={handleItemClick}
            />
          </SidebarMenuItem>

          {item.subItems && (
            <SidebarErrorBoundary>
              <SubMenu
                items={item.subItems}
                contentRef={(el) => {
                  if (contentRefs.current) {
                    contentRefs.current[index] = el;
                  }
                }}
                height="auto" // Always show sub-menus
                external={item.external}
              />
            </SidebarErrorBoundary>
          )}
        </div>
      </SidebarErrorBoundary>
    ));
  }, [isLoading, sidebarItems, current, handleItemClick, renderLoadingSkeletons]);

  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-white"
      role="navigation"
      aria-label="Main navigation"
    >
      <SidebarHeader 
        className="bg-white md:h-20 flex items-center justify-center border-b border-blue-100"
        role="banner"
      >
        <div className="transition-opacity duration-300 w-full">
          <div className="p-3 flex items-center justify-center group-data-[collapsible=icon]:p-2">
            <Logo />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent 
        className="bg-white flex-1 overflow-y-auto"
        role="main"
        aria-label="Navigation menu"
      >
        <SidebarGroup className="bg-white flex-1">
          <SidebarGroupContent>
            <SidebarMenu 
              className="p-3 group-data-[collapsible=icon]:p-2"
              role="menubar"
              aria-label="Main menu items"
            >
              {renderMenuItems()}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter 
        className="border-t border-blue-200 bg-white p-0 mt-auto"
        role="contentinfo"
        aria-label="Secondary navigation"
      >
        <SidebarMenu className="p-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t("pages.settings")}
              size="lg"
              className="h-14 text-black hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium border-l-4 border-l-transparent hover:border-l-blue-400 rounded-none m-0 group-data-[collapsible=icon]:justify-center"
            >
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center gap-4 w-full px-6 py-4 h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                aria-label={`Navigate to ${t("pages.settings")}`}
                role="menuitem"
              >
                <Settings 
                  className="h-6 w-6 flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium tracking-wide group-data-[collapsible=icon]:hidden">
                  {t("pages.settings")}
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
