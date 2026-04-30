export type SiteConfig = {
  name: string
  title: string
  description: string
  role: string
  bio: {
    greeting: string
    paragraphs: string[]
  }
  nav: {
    title: string
    href: string
  }[]
  socials: {
    title: string
    href: string
    username: string
  }[]
  footer: {
    credit: string
  }
}

export const siteConfig: SiteConfig = {
  name: "Baiq",
  title: "Baiq – Student, Developer",
  description: "An aspiring full-stack developer from Indonesia.",
  role: "Student • Developer",
  bio: {
    greeting: "Hello ~",
    paragraphs: [
      "At 22, I'm a dedicated developer always in pursuit of pushing the boundaries of web development. I continually explore new technologies and work on side projects to expand my skills and knowledge in building modern interfaces.",
      "I balance my technical passion with a love for sports, especially those that focus on muscle building. Fitness is a core part of my lifestyle, fueling my drive and discipline both in and out of work.",
      "When I'm not coding, I'm immersed in the sounds of phonk, rap, and melancholic music—melodies that resonate with my reflective mood. I also dabble in mobile development with React Native and thrive on the competitive spirit found in games like Marvel Rivals and CS2.",
    ],
  },
  nav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Logs",
      href: "/logs",
    },
    {
      title: "Guestbook",
      href: "/guestbook",
    },
    {
      title: "Projects",
      href: "/projects",
    },
    {
      title: "Posts",
      href: "/posts",
    },
  ],
  socials: [
    {
      title: "GitHub",
      href: "https://github.com/puruhitaaa",
      username: "@puruhitaaa",
    },
    {
      title: "Instagram",
      href: "https://instagram.com/baiqueee",
      username: "@baiqueee",
    },

    {
      title: "LinkedIn",
      href: "https://linkedin.com/in/pahuger-baiq",
      username: "@pahuger-baiq",
    },
    {
      title: "Email",
      href: "mailto:hughdev101@gmail.com",
      username: "hughdev101@gmail.com",
    },
    {
      title: "Discord",
      href: "https://discord.com/users/whatthedogdoin_",
      username: "@whatthedogdoin_",
    },
  ],
  footer: {
    credit: "made with ❤️ by baiq",
  },
} as const
