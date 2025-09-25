import { ZamaDiceGame } from "@/components/ZamaDiceGame";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center w-full px-3 md:px-0">
        <ZamaDiceGame />
      </div>
    </main>
  );
}
