import type { Metadata } from "next";
import PublishedView from "@/components/views/PublishedView";

export const metadata: Metadata = { title: "Published Posts" };

export default function Page() {
  return <PublishedView />;
}
