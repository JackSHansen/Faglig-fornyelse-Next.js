import { NextRequest, NextResponse } from "next/server";

type GeocodingResult = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

type ForecastResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: "Klart",
    1: "Let skyet",
    2: "Delvist skyet",
    3: "Overskyet",
    45: "Taage",
    48: "Rimtaage",
    51: "Let regn",
    53: "Regn",
    55: "Kraftig regn",
    61: "Regnbyger",
    63: "Regn",
    65: "Kraftig regn",
    71: "Snefald",
    73: "Sne",
    75: "Kraftig sne",
    80: "Regnbyger",
    81: "Regnbyger",
    82: "Kraftige regnbyger",
    95: "Torden",
  };

  return map[code] ?? "Ukendt vejr";
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();

  if (!city) {
    return NextResponse.json(
      { error: "Du skal angive en by." },
      { status: 400 },
    );
  }

  try {
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=da&format=json`,
      { cache: "no-store" },
    );

    if (!geocodeResponse.ok) {
      throw new Error("Geocoding service svarede med en fejl.");
    }

    const geocodeData = (await geocodeResponse.json()) as GeocodingResponse;
    const location = geocodeData.results?.[0];

    if (!location) {
      return NextResponse.json(
        { error: "Kunne ikke finde den by." },
        { status: 404 },
      );
    }

    const forecastResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`,
      { cache: "no-store" },
    );

    if (!forecastResponse.ok) {
      throw new Error("Forecast service svarede med en fejl.");
    }

    const forecastData = (await forecastResponse.json()) as ForecastResponse;

    if (!forecastData.current) {
      return NextResponse.json(
        { error: "Vejrdata var ikke tilgaengelige." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      city: location.name,
      country: location.country ?? "Ukendt",
      temperature: forecastData.current.temperature_2m ?? 0,
      windSpeed: forecastData.current.wind_speed_10m ?? 0,
      weatherDescription: weatherCodeToText(forecastData.current.weather_code ?? -1),
    });
  } catch {
    return NextResponse.json(
      { error: "Der opstod en fejl under hentning af vejrdata." },
      { status: 500 },
    );
  }
}
