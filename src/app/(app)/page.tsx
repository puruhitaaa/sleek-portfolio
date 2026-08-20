import SpotifyWidget from "@/components/widgets/SpotifyWidget";
import { siteConfig } from "@/site";
import BioSection from "./_components/BioSection";
import { db } from "@/server/db";
import { bio } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialBio = await db
    .select()
    .from(bio)
    .where(eq(bio.id, "default"))
    .limit(1)
    .then((res) => res[0])
    .catch(() => undefined);

  return (
    <div className="space-y-8">
      <BioSection initialData={initialBio} />


      <section>
        <SpotifyWidget />
      </section>

      <section className="space-y-4">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
          Find me here ~
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {siteConfig.socials.map((social) => (
            <li key={social.title}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <span className="font-medium">{social.title}</span>
                <span className="text-sm text-[initial] underline">
                  {social.username}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
