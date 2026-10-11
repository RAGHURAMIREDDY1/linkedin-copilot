import type { Metadata } from "next";
import TrendingView from "@/components/views/TrendingView";

export const metadata: Metadata = { title: "Trending Topics" };

export default function Page() {
  return <TrendingView />;
}
