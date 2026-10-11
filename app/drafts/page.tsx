import type { Metadata } from "next";
import DraftsView from "@/components/views/DraftsView";

export const metadata: Metadata = { title: "My Drafts" };

export default function Page() {
  return <DraftsView />;
}
