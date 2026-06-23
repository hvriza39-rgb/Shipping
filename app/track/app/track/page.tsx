import { Suspense } from "react";
import TrackingPage from "@/components/TrackingPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Track a Package | SwiftShip" };

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackingPage />
    </Suspense>
  );
}
