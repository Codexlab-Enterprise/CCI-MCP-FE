import { useState } from "react";
import { Menu } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { NavLinks } from "./navlinks";

import { siteConfig } from "@/config/site";
import { HeartFilledIcon, SearchIcon } from "@/components/icons";

export const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const searchInput = (
    <div className="relative w-full">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search"
        className="pl-9 pr-16 bg-muted text-sm"
        placeholder="Search..."
        type="search"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:inline-flex">
        ⌘K
      </kbd>
    </div>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background sm:block lg:hidden md:hidden">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <NextLink className="flex items-center gap-1" href="/">
            <Image
              alt="logo"
              className="rounded h-10 w-10"
              height={1000}
              src="/images/logo.png"
              width={1000}
            />
            <p className="font-bold">CCI</p>
          </NextLink>
          <div className="hidden lg:flex gap-4 ml-2">
            {NavLinks.map((item) => (
              <NextLink
                key={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary font-medium"
                    : "text-foreground",
                )}
                href={item.href}
              >
                {item.name}
              </NextLink>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="hidden lg:block w-64">{searchInput}</div>
          <Button
            asChild
            variant="secondary"
            className="hidden md:inline-flex text-sm font-normal"
          >
            <a href={siteConfig.links.sponsor} target="_blank" rel="noreferrer">
              <HeartFilledIcon className="mr-2 text-destructive" />
              Sponsor
            </a>
          </Button>
        </div>

        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-6 flex flex-col gap-2">
                {NavLinks.map((item, index) => (
                  <NextLink
                    key={`${item.href}-${index}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-base transition-colors hover:bg-accent",
                      pathname === item.href
                        ? "text-primary font-medium"
                        : index === siteConfig.navMenuItems.length - 1
                          ? "text-destructive"
                          : "text-foreground",
                    )}
                  >
                    {item.name}
                  </NextLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
