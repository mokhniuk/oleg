import { Url } from "next/dist/shared/lib/router/router";
import styles from "./section-header.module.scss";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  linkLabel?: string;
  linkUrl?: Url;
  sectionDescription?: string;
}

export default function SectionHeader({
  title,
  linkLabel,
  linkUrl,
  sectionDescription,
}: SectionHeaderProps) {
  return (
    <header className={styles["section-header"]}>
      <div className={styles["section-header__container"]}>
        <h2>{title}</h2>
        {linkUrl && (
          <Link
            href={linkUrl}
            title={title}
            className={styles["section-header__link"]}
            // aria-disabled
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {sectionDescription && (
        <p className={styles["lead-text"]}>{sectionDescription}</p>
      )}
    </header>
  );
}
