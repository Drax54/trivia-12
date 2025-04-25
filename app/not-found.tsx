import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-medium">Page not found</h2>
        <p className="mt-4 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </main>
    </div>
  );
}