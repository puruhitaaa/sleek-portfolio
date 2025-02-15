"use client";

import { siteConfig } from "@/site";
import RealTimeClock from "./RealtimeClock";

function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-800/90 px-4 py-8">
      <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <p>{siteConfig.footer.credit}</p>
        <RealTimeClock />
      </div>
    </footer>
  );
}

export default Footer;
