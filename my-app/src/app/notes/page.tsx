import Link from "next/link";
import { NotesPanel } from "@/components/dashboard/NotesPanel";
import styles from "../feature-page.module.scss";

export default function NotesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <h1>Noter</h1>
        <p>Her kan du arbejde med dine noter i en separat route.</p>
        <Link href="/">Tilbage til dashboard</Link>
      </div>

      <section className={styles.card}>
        <NotesPanel />
      </section>
    </main>
  );
}
