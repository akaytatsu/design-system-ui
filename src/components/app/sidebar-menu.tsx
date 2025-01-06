import { cn } from "@/lib";
import { LucideIcon } from "lucide-react";
import {
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui";

interface NavItem {
  title: string;
  icon?: LucideIcon;
  variant?: "link" | "default";
  active?: boolean;
  onClick?: () => void;
  subItems?: NavItem[]; // Suporte a subitens
}

interface NavProps {
  isCollapsed: boolean;
  links: NavItem[];
}

export function SidebarMenu({ links, isCollapsed }: NavProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <ScrollArea className="h-[90%] w-full">
        <nav>
          {links.map((link, index) => (
            <div key={index} className="w-full">
              {isCollapsed ? (
                <div className="">
                  {link.subItems?.length ? (
                    <div className={cn("w-full py-2")}>
                      <Separator className="h-[0.5px]" />
                    </div>
                  ) : (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => {
                            link.onClick?.();
                          }}
                          className={cn(
                            "group flex h-11 w-full cursor-pointer items-center border-l-4 pl-3.5 hover:border-brand hover:bg-brand/10 hover:text-brand",
                            link.active
                              ? "border-brand bg-brand/10"
                              : "border-white",
                          )}
                        >
                          {link.icon && (
                            <link.icon
                              className={cn(
                                "h-4 w-4 group-hover:stroke-brand",
                                link.active
                                  ? "stroke-brand"
                                  : "stroke-muted-foreground",
                              )}
                            />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="flex items-center gap-4"
                      >
                        {link.title}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {link.subItems && (
                    <div className="">
                      {link.subItems.map((subItem, subIndex) => (
                        <Tooltip key={subIndex} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => {
                                subItem.onClick?.();
                              }}
                              className={cn(
                                "group flex h-11 w-full cursor-pointer items-center border-l-4 pl-3.5 hover:border-brand hover:bg-brand/10 hover:text-brand",
                                subItem.active
                                  ? "border-brand bg-brand/10"
                                  : "border-white",
                              )}
                            >
                              {subItem.icon && (
                                <subItem.icon
                                  className={cn(
                                    "h-4 w-4 group-hover:stroke-brand",
                                    subItem.active
                                      ? "stroke-brand"
                                      : "stroke-muted-foreground",
                                  )}
                                />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="flex items-center gap-4"
                          >
                            {subItem.title}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="">
                  {link.subItems?.length ? (
                    <div className={cn("w-full pt-5")}>
                      <div className="truncate pl-3.5 text-left text-xs text-brand">
                        {link.title?.toUpperCase()}
                      </div>
                      <Separator className="mt-2 h-[0.5px]" />
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        link.onClick?.();
                      }}
                      className={cn(
                        "group flex h-11 cursor-pointer items-center justify-start truncate border-l-4 pl-3.5 text-sm font-medium hover:border-brand hover:bg-brand/10 hover:text-brand",
                        link.active
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-white text-muted-foreground",
                      )}
                    >
                      {link.icon && (
                        <link.icon
                          className={cn(
                            "mr-3 h-3.5 w-3.5 group-hover:stroke-brand",
                            link.active
                              ? "stroke-brand"
                              : "stroke-muted-foreground",
                          )}
                        />
                      )}
                      {link.title}
                    </div>
                  )}

                  {link.subItems && (
                    <div className="">
                      {link.subItems.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          onClick={() => subItem.onClick?.()}
                          className={cn(
                            "group flex h-11 cursor-pointer items-center justify-start truncate border-l-4 pl-3.5 text-sm font-medium hover:border-brand hover:bg-brand/10 hover:text-brand",
                            subItem.active
                              ? "border-brand bg-brand/10 text-brand"
                              : "border-white text-muted-foreground",
                          )}
                        >
                          {subItem.icon && (
                            <subItem.icon
                              className={cn(
                                "mr-2 h-3.5 w-3.5 group-hover:stroke-brand",
                                subItem.active
                                  ? "stroke-brand"
                                  : "stroke-muted-foreground",
                              )}
                            />
                          )}
                          {subItem.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </TooltipProvider>
  );
}
