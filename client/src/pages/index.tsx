import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className={`${workSans.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}>
    </div>
  )
}
