import Footer from "@/components/shared/Footer"
import Header from "@/components/shared/Header"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='min-h-screen dark:from-zinc-950 dark:via-stone-900 dark:to-neutral-950 bg-gradient-to-tr text-zinc-100 relative from-zinc-50 via-stone-100 to-neutral-50'>
      <div className='lg:max-w-[55%] w-full mx-auto p-4 py-24'>
        <Header />
        <main className='flex flex-col w-full h-full px-4 py-8'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
