"use client";

import Link from "next/link";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { NotesPanel } from "@/components/dashboard/NotesPanel";
import { TodoPanel } from "@/components/dashboard/TodoPanel";
import styles from "./DashboardClient.module.scss";

type Theme = "light" | "dark";
type WidgetId = "clock" | "notes" | "todo" | "weather";

type WeatherData = {
  city: string;
  country: string;
  temperature: number;
  windSpeed: number;
  weatherDescription: string;
};

const WIDGET_ORDER_KEY = "dashboard-widget-order-v1";
const THEME_KEY = "dashboard-theme-v1";
const DEFAULT_ORDER: WidgetId[] = ["clock", "notes", "todo", "weather"];
const DEFAULT_CITY = "Copenhagen";

function reorderWidgets(order: WidgetId[], fromId: WidgetId, toId: WidgetId): WidgetId[] {
  const sourceIndex = order.indexOf(fromId);
  const targetIndex = order.indexOf(toId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return order;
  }

  const next = [...order];
  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, fromId);
  return next;
}

export function DashboardClient() {
  const [theme, setTheme] = useState<Theme>("light");
  const [now, setNow] = useState(new Date());
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(DEFAULT_ORDER);
  const [dragging, setDragging] = useState<WidgetId | null>(null);

  const [cityQuery, setCityQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const storedOrder = localStorage.getItem(WIDGET_ORDER_KEY);
    if (!storedOrder) {
      return;
    }

    try {
      const parsed = JSON.parse(storedOrder) as WidgetId[];
      const valid = parsed.filter((item) => DEFAULT_ORDER.includes(item));

      if (valid.length === DEFAULT_ORDER.length) {
        setWidgetOrder(valid);
      }
    } catch {
      localStorage.removeItem(WIDGET_ORDER_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  const fetchWeather = useCallback(async (city: string) => {
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const payload = (await response.json()) as WeatherData & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Kunne ikke hente vejrdata.");
      }

      setWeather(payload);
    } catch (error) {
      setWeather(null);
      setWeatherError(error instanceof Error ? error.message : "Ukendt fejl.");
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    void fetchWeather(DEFAULT_CITY);
  }, [fetchWeather]);

  const widgetViews = useMemo<Record<WidgetId, ReactNode>>(
    () => ({
      clock: (
        <article className={styles.widget}>
          <header>
            <h2>Dato og tid</h2>
          </header>
          <p className={styles.time}>{now.toLocaleTimeString("da-DK")}</p>
          <p className={styles.date}>{now.toLocaleDateString("da-DK", { dateStyle: "full" })}</p>
        </article>
      ),
      notes: (
        <article className={styles.widget}>
          <header>
            <h2>Noter</h2>
            <Link href="/notes">Aaben side</Link>
          </header>
          <NotesPanel compact />
        </article>
      ),
      todo: (
        <article className={styles.widget}>
          <header>
            <h2>To-do</h2>
            <Link href="/tasks">Aaben side</Link>
          </header>
          <TodoPanel compact />
        </article>
      ),
      weather: (
        <article className={styles.widget}>
          <header>
            <h2>Vejr</h2>
          </header>
          <form
            className={styles.weatherForm}
            onSubmit={(event) => {
              event.preventDefault();
              void fetchWeather(cityQuery);
            }}
          >
            <input
              value={cityQuery}
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder="Soeg efter by"
            />
            <button type="submit" disabled={loadingWeather}>
              {loadingWeather ? "Henter..." : "Soeg"}
            </button>
          </form>

          {weatherError ? <p className={styles.error}>{weatherError}</p> : null}

          {weather ? (
            <div className={styles.weatherResult}>
              <p>
                <strong>{weather.city}</strong>, {weather.country}
              </p>
              <p>{weather.temperature.toFixed(1)} C</p>
              <p>{weather.weatherDescription}</p>
              <p>Vind: {weather.windSpeed.toFixed(1)} km/t</p>
            </div>
          ) : null}
        </article>
      ),
    }),
    [cityQuery, fetchWeather, loadingWeather, now, weather, weatherError],
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Personligt Dashboard</p>
          <h1>Dit daglige overblik i en samlet app</h1>
          <p>
            Traek widgets rundt for at tilpasse layoutet. Data gemmes lokalt, saa din opsaetning bliver husket.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTheme((previous) => (previous === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "Skift til dark mode" : "Skift til light mode"}
        </button>
      </section>

      <section className={styles.grid}>
        {widgetOrder.map((widgetId) => (
          <div
            key={widgetId}
            draggable
            onDragStart={() => setDragging(widgetId)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (!dragging || dragging === widgetId) {
                return;
              }
              setWidgetOrder((previous) => reorderWidgets(previous, dragging, widgetId));
              setDragging(null);
            }}
            onDragEnd={() => setDragging(null)}
            className={dragging === widgetId ? styles.dragging : ""}
          >
            {widgetViews[widgetId]}
          </div>
        ))}
      </section>
    </main>
  );
}
