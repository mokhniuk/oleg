"use client";

import { useEffect, useRef } from "react";
import styles from "./screens-grid.module.scss";
import Image from "next/image";
import BrowserFrame from "../BrowserFrame/BrowserFrame";

interface ScreensGridProps {
    images: string[];
}

const ScreensGrid: React.FC<ScreensGridProps> = ({ images }) => {
    const leftColumnRef = useRef<HTMLDivElement>(null);
    const rightColumnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let requestRunning = false;

        const handleScroll = () => {
            if (!requestRunning) {
                requestRunning = true;
                requestAnimationFrame(() => {
                    if (window.innerWidth >= 768 && leftColumnRef.current && rightColumnRef.current) {
                        const scrolled = window.scrollY;
                        // Subtle parallax: Right column moves slightly slower (appears further back)
                        // Left column moves slightly faster (appears closer)
                        const rate = 0.03;
                        const leftOffset = scrolled * -rate;
                        const rightOffset = scrolled * rate;

                        leftColumnRef.current.style.transform = `translate3d(0, ${leftOffset}px, 0)`;
                        rightColumnRef.current.style.transform = `translate3d(0, ${rightOffset}px, 0)`;
                    } else if (leftColumnRef.current && rightColumnRef.current) {
                        // Reset on mobile
                        leftColumnRef.current.style.transform = 'none';
                        rightColumnRef.current.style.transform = 'none';
                    }
                    requestRunning = false;
                });
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial position

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const leftImages = images.filter((_, i) => i % 2 === 0);
    const rightImages = images.filter((_, i) => i % 2 !== 0);

    return (
        <div className={styles.grid}>
            <div className={styles.column} ref={leftColumnRef}>
                {leftImages.map((image, index) => (
                    <div key={`left-${index}`} className={styles.gridItem}>
                        <BrowserFrame mode="small">
                            <Image
                                src={image}
                                alt={`Screenshot L${index + 1}`}
                                width={800}
                                height={600}
                                className={styles.image}
                            />
                        </BrowserFrame>
                    </div>
                ))}
            </div>
            <div className={styles.column} ref={rightColumnRef}>
                {rightImages.map((image, index) => (
                    <div key={`right-${index}`} className={styles.gridItem}>
                        <BrowserFrame mode="small">
                            <Image
                                src={image}
                                alt={`Screenshot R${index + 1}`}
                                width={800}
                                height={600}
                                className={styles.image}
                            />
                        </BrowserFrame>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScreensGrid;
