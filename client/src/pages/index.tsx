import { MessagePane } from "@/components/MessagePane";
import { ThreadList } from "@/components/ThreadList";
import { Thread } from "@/utils/types";
import { Work_Sans } from "next/font/google";
import { useCallback, useState } from "react";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export default function Home() {
  const [selectedThread, setSelectedThread] = useState<Partial<Thread> | null>(null);

  const onSelect = useCallback((id: string, title: string) => {
    setSelectedThread({ id, title });
  }, []);

  return (
    <div className={`${workSans.className} text-dark dark:text-primary flex h-screen overflow-hidden flex-col bg-zinc-50 font-sans dark:bg-dark`}>
      <header className="border-b border-dark/50 dark:border-primary/50 p-4">
        <h1 className="text-2xl font-bold text-center">Thread Viewer</h1>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <ThreadList selectedThreadId={selectedThread?.id || null} onSelect={onSelect} />
        <MessagePane threadId={selectedThread?.id || null} />
      </main>
    </div>
  )
}
