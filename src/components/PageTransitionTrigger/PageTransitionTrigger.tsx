"use client";

import { useEffect } from "react";
import { usePageTransition } from "@/contexts/PageTransitionContext";

/**
 * Client component that triggers the page transition fade-out
 * when a work page loads after navigating from a project card
 */
export default function PageTransitionTrigger() {
    const { isTransitioning, startFadeOut, endTransition } = usePageTransition();

    useEffect(() => {
        if (isTransitioning) {
            // Start the fade-out animation immediately when the page loads
            startFadeOut();

            // End the transition after the fade-out completes
            endTransition();
        }
    }, [isTransitioning, startFadeOut, endTransition]);

    return null; // This component doesn't render anything
}
