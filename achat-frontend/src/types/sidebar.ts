import { LucideIcon } from "lucide-react";
import { RefObject } from "react";
import type { MessageKeys } from "next-intl";
import { Messages } from "../../global";

export interface SubMenuItem {
  title: string;
  url: string;
  parent?: string;
}

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  external?: boolean;
  alertCount?: number;
  subItems?: SubMenuItem[];
}

export interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  url?: string;
  external?: boolean;
  alertCount?: number;
  isActive: boolean;
  hasSubItems: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

export interface SubMenuProps {
  items: SubMenuItem[];
  isOpen: boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  height: string;
  external?: boolean;
}

export interface SidebarItemData {
  titleKey: SidebarTranslationKey;
  icon: string;
  url: string;
  external?: boolean;
  alertCount?: number;
  subItems?: {
    titleKey: SidebarTranslationKey;
    url: string;
    parent?: string;
  }[];
}

export interface SubMenuItemData {
  titleKey: MessageKeys<Messages, "pages">;
  url: string;
  parent?: string;
}

export type SidebarTranslationKey = MessageKeys<Messages, "sidebar">; 