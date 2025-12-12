"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface PageTransitionContextType {
    isTransitioning: boolean;
    isFading: boolean;
    transitionColor: string;
    startTransition: (color: string) => void;
    endTransition: () => void;
    startFadeOut: () => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [transitionColor, setTransitionColor] = useState("#ffffff");

    const startTransition = useCallback((color: string) => {
        setTransitionColor(color);
        setIsTransitioning(true);
        setIsFading(false);
    }, []);

    const startFadeOut = useCallback(() => {
        setIsFading(true);
    }, []);

    const endTransition = useCallback(() => {
        // After fade-out animation completes, reset everything
        setTimeout(() => {
            setIsTransitioning(false);
            setIsFading(false);
        }, 600); // Match CSS transition duration
    }, []);

    return (
        <PageTransitionContext.Provider
            value={{
                isTransitioning,
                isFading,
                transitionColor,
                startTransition,
                endTransition,
                startFadeOut,
            }}
        >
            {children}
        </PageTransitionContext.Provider>
    );
};

export const usePageTransition = () => {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error("usePageTransition must be used within PageTransitionProvider");
    }
    return context;
};
