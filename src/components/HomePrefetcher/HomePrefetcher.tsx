"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { preloadFonts } from "@/utils/fontLoader";

type PrefetchTarget = {
  slug: string;
  fonts?: {
    title: string;
    text: string;
    customTitleFont?: boolean;
    customTextFont?: boolean;
  };
};

export default function HomePrefetcher({ targets }: { targets: PrefetchTarget[] }) {
  const router = useRouter();

  useEffect(() => {
    const prefetchQueue = async () => {
      // Wait a bit for the main page logic/hydration to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      for (const target of targets) {
        if (!target.slug) continue;

        // Prefetch the page code/data using Next.js router
        router.prefetch(`/work/${target.slug}`);

        // Preload fonts (low priority)
        preloadFonts(target.fonts, target.slug, 'prefetch');

        // Small delay between requests to preserve bandwidth and thread
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    };

    // Use requestIdleCallback if available for even lower impact
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        prefetchQueue();
      });
    } else {
      setTimeout(prefetchQueue, 400);
    }
  }, [targets, router]);

  return null;
}
