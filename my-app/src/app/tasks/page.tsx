import Link from "next/link";
import { TodoPanel } from "@/components/dashboard/TodoPanel";
import styles from "../feature-page.module.scss";

export default function TasksPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <h1>To-do</h1>
        <p>Administrer opgaver i en dedikeret route med samme data.</p>
        <Link href="/">Tilbage til dashboard</Link>
      </div>

      <section className={styles.card}>
        <TodoPanel />
      </section>
    </main>
  );
}
