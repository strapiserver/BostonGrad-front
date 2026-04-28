import { ICity } from "../../types/exchange";

export type ClosestCityMatch = {
  city: ICity;
  slug: string;
  distanceKm: number;
  ratesTotal: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

type LatLngLike = { lat: number; lng: number };

const hasCoordinates = (
  coordinates?: number[]
): coordinates is [number, number] =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every(
    (value) => typeof value === "number" && !Number.isNaN(value)
  );

export const getCitySlug = (city: Pick<ICity, "en_name">) =>
  (city.en_name || "").toLowerCase();

const distanceBetween = (
  from: [number, number],
  to: [number, number]
): number => {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const normalizeSlug = (value?: string | null) => (value || "").toLowerCase();

export const isCloseByCoordinates = (
  a?: LatLngLike | null,
  b?: LatLngLike | null,
  thresholdMeters = 100
) => {
  if (!a || !b) return false;
  const { lat: lat1, lng: lng1 } = a;
  const { lat: lat2, lng: lng2 } = b;

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return false;
  }

  const distanceKm = distanceBetween([lat1, lng1], [lat2, lng2]);
  return distanceKm * 1000 <= thresholdMeters;
};

export const getClosestCitiesByCoordinates = ({
  city,
  cities,
  allowedSlugs,
  cityRatesTotals,
  limit = 3,
}: {
  city: ICity;
  cities: ICity[];
  allowedSlugs?: string[];
  cityRatesTotals?: Record<string, number>;
  limit?: number;
}): ClosestCityMatch[] => {
  if (!hasCoordinates(city.coordinates) || !Array.isArray(cities)) {
    return [];
  }

  const targetCoords = city.coordinates as [number, number];
  const allowed = allowedSlugs
    ? new Set(allowedSlugs.map((slug) => normalizeSlug(slug)))
    : null;
  const currentSlug = normalizeSlug(city.en_name);

  return cities
    .filter((candidate) => candidate && candidate !== city)
    .filter((candidate) => {
      if (!hasCoordinates(candidate.coordinates)) return false;
      if (!allowed) return true;
      const slug = normalizeSlug(candidate.en_name);
      return slug !== currentSlug && allowed.has(slug);
    })
    .map((candidate) => {
      const slug = normalizeSlug(candidate.en_name);
      return {
        city: candidate,
        slug,
        distanceKm: distanceBetween(
          targetCoords,
          candidate.coordinates as [number, number]
        ),
        ratesTotal: cityRatesTotals?.[slug] ?? 0,
      };
    })
    .filter((item) => !Number.isNaN(item.distanceKm))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
};
