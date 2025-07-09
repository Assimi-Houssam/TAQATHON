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
    if (sidebarItems && Array.isArray(sidebarItems)) {
      const length = Math.max(0, sidebarItems.length);
      contentRefs.current = Array(length).fill(null);
      setHeights(Array(length).fill("0px"));
    } else {
      contentRefs.current = [];
      setHeights([]);
    }
    setIsLoading(false);
  }, [sidebarItems]);

  // Update isLoading to consider userLoading
  useEffect(() => {
    if (!userLoading) {
      setIsLoading(false);
    }
  }, [userLoading]);



  const handleOpen = useCallback((index: number) => {
    // Validate index
    if (typeof index !== 'number' || index < 0 || !isFinite(index)) {
      console.warn('Invalid index provided to handleOpen:', index);
      return;
    }

    // If clicking the current tab while it's already open, do nothing
    if (index === current && open) {
      return;
    }

    try {
      if (index === current) {
        setOpen(!open);
        setHeights((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((h, i) =>
            i === index
              ? !open
                ? `${contentRefs.current?.[index]?.scrollHeight || 0}px`
                : "0px"
              : "0px"
          );
        });
      } else {
        // Close previous menu before opening new one
        setHeights((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((_, i) =>
            i === index
              ? `${contentRefs.current?.[index]?.scrollHeight || 0}px`
              : "0px"
          );
        });
        setCurrent(index);
        setOpen(true);
      }
    } catch (error) {
      console.warn('Error in handleOpen:', error);
    }
  }, [current, open]);

  // Modify the useEffect for path matching
  useEffect(() => {
    try {
      if (!sidebarItems || !Array.isArray(sidebarItems) || sidebarItems.length === 0) {
        return;
      }

      const path = window?.location?.pathname?.slice(3) || '';
      const index = sidebarItems.findIndex((item) => {
        if (!item) return false;
        
        const exactMatch = item.url === path;
        const subItemMatch = item.subItems?.some((sub) => sub?.url === path) || false;
        return exactMatch || subItemMatch;
      });

      if (index !== -1 && index < sidebarItems.length) {
        setCurrent(index);
        setOpen(true);
        // Update height for matched item with a slight delay for smooth animation
        requestAnimationFrame(() => {
          setHeights((prev) => {
            if (!Array.isArray(prev)) return [];
            return prev.map((_, i) =>
              i === index
                ? `${contentRefs.current?.[index]?.scrollHeight || 0}px`
                : "0px"
            );
          });
        });
      }
    } catch (error) {
      console.warn('Error in path matching:', error);
    }
  }, [sidebarItems]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if sidebar is focused or contains focused element
      if (!document.activeElement?.closest('[role="navigation"]')) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          // Close expanded menus on escape
          if (open && current !== null) {
            setOpen(false);
            setHeights(prev => prev.map(() => "0px"));
          }
          break;
        case 'Home':
          event.preventDefault();
          // Focus first menu item
          const firstItem = document.querySelector('[role="menubar"] [role="menuitem"]') as HTMLElement;
          firstItem?.focus();
          break;
        case 'End':
          event.preventDefault();
          // Focus last menu item
          const menuItems = document.querySelectorAll('[role="menubar"] [role="menuitem"]');
          const lastItem = menuItems[menuItems.length - 1] as HTMLElement;
          lastItem?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, current]);

  // Safe render function for loading skeletons
  const renderLoadingSkeletons = useCallback(() => {
    const skeletonCount = 6; // Show 6 skeleton items while loading
    return Array.from({ length: skeletonCount }, (_, index) => (
      <SidebarMenuItem key={`skeleton-${index}`}>
        <SidebarMenuSkeleton showIcon index={index} className="h-14 my-1" />
      </SidebarMenuItem>
    ));
  }, []);

  // Safe render function for menu items
  const renderMenuItems = useCallback(() => {
    if (isLoading || userLoading) {
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
              isActive={current === index && open}
              onClick={() => {
                try {
                  handleOpen(index);
                  if (isMobile) {
                    // toggleSidebar();
                  }
                } catch (error) {
                  console.warn('Error handling menu item click:', error);
                }
              }}
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
                height={heights[index] || "0px"}
                external={item.external}
              />
            </SidebarErrorBoundary>
          )}
        </div>
      </SidebarErrorBoundary>
    ));
  }, [isLoading, userLoading, sidebarItems, current, open, heights, isMobile, handleOpen, renderLoadingSkeletons]);

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
