"use client";

import React from "react";
import { usePageTransition } from "@/contexts/PageTransitionContext";
import styles from "./PageTransitionOverlay.module.css";

const PageTransitionOverlay: React.FC = () => {
    const { isTransitioning, isFading, transitionColor } = usePageTransition();

    const overlayClass = `${styles.overlay} ${isTransitioning ? (isFading ? styles.fading : styles.active) : ""
        }`;

    return (
        <div
            className={overlayClass}
            style={{ backgroundColor: transitionColor }}
        />
    );
};

export default PageTransitionOverlay;
