"use client";

import { Suspense } from "react";
import HomePageContent from "../../components/app/public/home-page/home-page";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
