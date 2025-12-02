import styles from "./image-gallery.module.scss";
import Image from "next/image";

interface ImageGalleryProps {
    images: string[];
    columns?: 1 | 2 | 3;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    columns = 2,
}) => {
    return (
        <div
            className={styles.gallery}
            data-columns={columns}
        >
            {images.map((image, index) => (
                <div key={index} className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        width={800}
                        height={600}
                        className={styles.image}
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;
