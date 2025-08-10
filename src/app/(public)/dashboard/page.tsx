import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      {" "}
      {/* Adjust min-height based on header height */}
      <ClipboardList className="w-24 h-24 text-primary-pink mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">No Data!</h1>
      <p className="text-gray-600 mb-6">Explore more items to fill it up!</p>
      <Link href="/" passHref>
        <Button className="bg-primary-pink hover:bg-primary-pink/90 text-white px-8 py-3 rounded-full flex items-center gap-2">
          Start Shopping now <span className="text-xl">&rarr;</span>
        </Button>
      </Link>
    </div>
  );
}
