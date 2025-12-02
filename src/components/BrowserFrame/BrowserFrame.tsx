import React from "react";
import styles from "./browser-frame.module.scss";

interface BrowserFrameProps {
    children: React.ReactNode;
    className?: string;
}

const BrowserFrame: React.FC<BrowserFrameProps> = ({ children, className }) => {
    return (
        <figure className={`${styles.frame} ${className || ""}`}>
            <div className={styles.chrome}>
                <div className={styles.trafficLights}>
                    <span className={styles.trafficLight}></span>
                    <span className={styles.trafficLight}></span>
                    <span className={styles.trafficLight}></span>
                </div>
            </div>
            <div className={styles.content}>{children}</div>
        </figure>
    );
};

export default BrowserFrame;
