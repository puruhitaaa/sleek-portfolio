"use client";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/site";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Button } from "../ui/button";
import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "@/lib/auth-client";

function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const { data: authData } = useSession();

  const handleLogin = async () => {
    await signIn.social({ provider: "google" });
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="space-y-6 px-4 py-8">
      <div className="group flex items-center gap-4">
        <Image
          src="/assets/images/home-pic.webp"
          alt={siteConfig.name}
          width={48}
          height={48}
          className="rounded-full grayscale transition-all duration-300 group-hover:grayscale-0"
        />
        <div>
          <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
            {siteConfig.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {siteConfig.role}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="rounded-lg border border-stone-800/90 bg-stone-900/80 p-[0.4rem] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <ul className="flex items-center gap-4 overflow-x-auto">
            {siteConfig.nav.map((item) => (
              <li
                className="relative px-4 py-2 duration-300 ease-in"
                key={item.href}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "relative z-10 whitespace-nowrap text-zinc-400 hover:text-zinc-100",
                    isActive(item.href) && "text-zinc-100",
                  )}
                >
                  {item.title}
                </Link>

                {isActive(item.href) && (
                  <div className="absolute inset-0 -z-10 rounded-md border border-stone-700/30 bg-stone-800/80" />
                )}
              </li>
            ))}
            <li className="relative px-4 py-2 duration-300 ease-in">
              <Link
                className="relative z-10 whitespace-nowrap text-zinc-400 hover:text-zinc-100"
                href={`${process.env.NEXT_PUBLIC_RESUME_URL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </Link>
            </li>
          </ul>
          <div className="ml-4 flex items-center gap-2">
            <ModeToggle />
            {authData?.session ? (
              <Button
                className="text-zinc-50"
                variant="destructive"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut />
              </Button>
            ) : (
              <Button
                className="bg-green-700 text-zinc-50 hover:bg-green-900"
                size="icon"
                onClick={handleLogin}
              >
                <LogIn />
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
