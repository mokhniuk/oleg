import styles from "./screens-grid.module.scss";
import Image from "next/image";
import BrowserFrame from "../BrowserFrame/BrowserFrame";

interface ScreensGridProps {
    images: string[];
}

const ScreensGrid: React.FC<ScreensGridProps> = ({ images }) => {
    return (
        <div className={styles.grid}>
            {images.map((image, index) => (
                <div key={index} className={styles.gridItem}>
                    <BrowserFrame>
                        <Image
                            src={image}
                            alt={`Screenshot ${index + 1}`}
                            width={800}
                            height={600}
                            className={styles.image}
                        />
                    </BrowserFrame>
                </div>
            ))}
        </div>
    );
};

export default ScreensGrid;
