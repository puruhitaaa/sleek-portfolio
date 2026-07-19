import SpotifyWidget from "@/components/widgets/SpotifyWidget";
import { siteConfig } from "@/site";

export default async function Home() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
          {siteConfig.bio.greeting}
        </h2>

        {siteConfig.bio.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-justify text-zinc-600 dark:text-zinc-400"
          >
            {paragraph}
          </p>
        ))}
      </section>

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
