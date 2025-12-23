import styles from "./dj-page.module.scss";
import mainStyles from "@/app/page.module.css";
import CaseStudyHero from "@/components/CaseStudyHero/CaseStudyHero";
import CaseStudySection from "@/components/CaseStudySection/CaseStudySection";
import ImageGallery from "@/components/ImageGallery/ImageGallery";
import { DJ_INFO, DJ_EVENTS, DJ_PHOTOS, DJ_PARTNERS, DJ_RECORDS } from "@/data/dj";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "DJing | Oleg Mokhniuk",
    description: "Vinyl-only DJ performances by Oleg Mokhniuk",
};

export default function DJPage() {
    return (
        <div className={styles.main}>
            <header className={styles.hero}>
                <CaseStudyHero
                    title="DJ Mokhniuk"
                    description={DJ_INFO.summary}
                    bgColor="#fafafa"
                />
            </header>

            <section className={styles.coverImage}>
                <figure className={styles.caseStudyCoverImage}>
                    <Image
                        src="/images/dj/cover-2.jpg"
                        alt="DJ Record"
                        fill
                        style={{ objectFit: "cover" }}
                        className={styles.recordImage}
                    />
                </figure>
            </section>
            <CaseStudySection title="Upcoming & Past Events">
                <div className={styles.eventsList}>
                    {DJ_EVENTS
                        .map(event => {
                            const eventDate = new Date(event.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            // Event is past if today is after the event date
                            const isPast = today > eventDate;
                            return {
                                ...event,
                                displayStatus: isPast ? "past" : "upcoming"
                            };
                        })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((event, index) => (
                            <div key={index} className={styles.eventItem}>
                                <span className={styles.eventDate}>
                                    {new Date(event.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                                <span className={styles.eventCity}>{event.city}</span>
                                <span className={styles.eventVenue}>{event.venue}</span>

                                {event.link ? (
                                    <a
                                        href={event.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.eventStatus}
                                        data-status={event.displayStatus}
                                    >
                                        {event.displayStatus}
                                    </a>
                                ) : (
                                    <span
                                        className={styles.eventStatus}
                                        data-status={event.displayStatus}
                                    >
                                        {event.displayStatus}
                                    </span>
                                )}
                            </div>
                        ))}
                </div>
            </CaseStudySection>


            <section className={styles.marquee}>
                <div className={styles.marqueeContent}>
                    {/* Double the items for seamless scrolling */}
                    {[...DJ_PARTNERS, ...DJ_PARTNERS].map((partner, index) => (
                        <span key={index} className={styles.marqueeItem}>
                            {partner}
                        </span>
                    ))}
                </div>
            </section>

            <CaseStudySection title="Moments">
                <ImageGallery images={DJ_PHOTOS} columns={2} />
            </CaseStudySection>

            <CaseStudySection title="Technical Rider">
                <div style={{ maxWidth: 800 }}>
                    <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
                        I will need the following equipment to perform:
                    </p>
                </div>
                <div className={styles.riderGrid}>
                    {DJ_INFO.technicalRider.map((item, index) => (
                        <div key={index} className={styles.riderItem}>
                            {item.image && (
                                <div className={styles.riderThumb}>
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <div className={styles.riderMeta}>
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CaseStudySection>

            <CaseStudySection title="Booking Request">
                <div style={{ maxWidth: 800 }}>
                    <p style={{ color: "#666", marginBottom: "3rem", fontSize: "1.1rem" }}>
                        Interested in booking me for your event? <br />Feel free to reach me out by email:{" "}
                        <a href={`mailto:${DJ_INFO.bookingEmail}`}>{DJ_INFO.bookingEmail}</a>.
                    </p>

                </div>
            </CaseStudySection>
        </div>
    );
}
