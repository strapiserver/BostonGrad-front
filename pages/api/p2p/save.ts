import type { NextApiRequest, NextApiResponse } from "next";
import {
  createP2POfferMutation,
  updateP2PMakerMutation,
  updateP2PMakerOffersMutation,
  updateP2POfferMutation,
} from "../../../services/queries";
import { normalizeTelegramSlug } from "../../../services/telegram";
import { requestStrapiAsService } from "../../../services/server/strapiClient";
import {
  verifyTelegramSlugServer,
  verifyTelegramTokenServer,
} from "../../../services/server/telegramVerify";
import {
  clearTelegramConfirmation,
  getTelegramConfirmation,
} from "../../../cache/telegramConfirm";

const MAKER_OWNERSHIP_QUERY = `
  query P2PMakerOwnership($id: ID!) {
    p2PMaker(id: $id) {
      data {
        id
        attributes {
          telegram_username
          offers {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

const OFFERS_AFTER_SAVE_QUERY = `
  query P2POffersAfterSave($ids: [ID]) {
    p2POffers(filters: { id: { in: $ids } }) {
      data {
        id
        attributes {
          dir
          side
          isActive
          follow_market
          course
          min
          max
          fee_type
          fee_amount
          city_from
          city_to
        }
      }
    }
  }
`;

type SaveP2PBody = {
  makerId?: string;
  makerSlug?: string;
  confirmToken?: string | null;
  maker?: {
    status?: string;
    telegram_name?: string | null;
    description?: string | null;
    coordinates?: number[] | null;
    top_parameters?: Array<
      | string
      | number
      | null
      | {
          id?: string | number | null;
        }
    > | null;
  };
  offers?: Array<{
    id?: string | number | null;
    dir?: string;
    side?: string;
    isActive?: boolean;
    follow_market?: boolean;
    fee_enabled?: boolean;
    course?: number | null;
    min?: number | null;
    max?: number | null;
    fee_type?: string | null;
    fee_amount?: number | null;
    city_from?: string | null;
    city_to?: string | null;
    top_parameters?: Array<
      | string
      | number
      | null
      | {
          id?: string | number | null;
        }
    > | null;
    givePm?: { code?: string };
    getPm?: { code?: string };
  }>;
};

type SaveP2PResponse =
  | {
      ok: true;
      makerId: string;
      offersLinked: number;
    }
  | {
      ok: false;
      error: string;
    };

type MakerOwnershipResponse = {
  p2PMaker?: {
    data?: {
      id?: string | number;
      attributes?: {
        telegram_username?: string | null;
        offers?: {
          data?: Array<{ id?: string | number }>;
        } | null;
      };
    } | null;
  };
};

type OffersAfterSaveResponse = {
  p2POffers?: {
    data?: Array<{
      id?: string | number;
      attributes?: {
        dir?: string | null;
        side?: string | null;
        isActive?: boolean | null;
        follow_market?: boolean | null;
        course?: number | null;
        min?: number | null;
        max?: number | null;
        fee_type?: string | null;
        fee_amount?: number | null;
        city_from?: string | null;
        city_to?: string | null;
      } | null;
    }>;
  };
};

const isExpired = (expiresAt?: string | null) => {
  if (!expiresAt) return false;
  const expMs = Date.parse(expiresAt);
  if (Number.isNaN(expMs)) return false;
  return expMs <= Date.now();
};

const parseNullableNumber = (value: unknown): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toNonNegative = (value: number | null | undefined) => {
  if (typeof value !== "number") return value;
  return value < 0 ? 0 : value;
};

const normalizeOptionalString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized : null;
};

const normalizeSide = (value: unknown): "give" | "get" | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "give" || normalized === "get") return normalized;
  return undefined;
};

const normalizeFeeType = (
  value: unknown,
): "give" | "get" | "percentage" | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "give" || normalized === "get" || normalized === "percentage") {
    return normalized;
  }
  return undefined;
};

const normalizeDir = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  return normalized || undefined;
};

const normalizeRelationIds = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;

  const ids = value
    .map((item) => {
      if (item === null || item === undefined) return "";
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }
      if (typeof item === "object") {
        const rawId = (item as { id?: string | number | null }).id;
        if (typeof rawId === "string" || typeof rawId === "number") {
          return String(rawId);
        }
      }
      return "";
    })
    .filter(Boolean);

  return Array.from(new Set(ids));
};

const isValidBody = (body: SaveP2PBody) =>
  Boolean(
    body &&
      typeof body === "object" &&
      body.makerId &&
      body.makerSlug &&
      Array.isArray(body.offers),
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SaveP2PResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const body = (req.body || {}) as SaveP2PBody;
  if (!isValidBody(body)) {
    return res.status(400).json({ ok: false, error: "invalid_payload" });
  }

  if (!body.offers?.length) {
    return res.status(400).json({ ok: false, error: "offers_required" });
  }

  const makerId = String(body.makerId);
  const normalizedSlug = normalizeTelegramSlug(body.makerSlug).toLowerCase();
  if (!normalizedSlug) {
    return res.status(400).json({ ok: false, error: "invalid_slug" });
  }

  let confirmationValid = false;
  if (body.confirmToken) {
    const verifyResponse = await verifyTelegramTokenServer(body.confirmToken);
    const verifiedSlug = normalizeTelegramSlug(verifyResponse?.slug).toLowerCase();
    if (verifyResponse?.ok && verifiedSlug === normalizedSlug) {
      confirmationValid = true;
    } else {
      console.warn("[p2p/save] verify token failed", {
        makerId,
        slug: normalizedSlug,
        verifyOk: Boolean(verifyResponse?.ok),
        verifiedSlug,
      });
    }
  }

  if (!confirmationValid) {
    const confirmation = await getTelegramConfirmation(normalizedSlug);
    if (confirmation?.ok && confirmation.confirmToken) {
      if (isExpired(confirmation.expiresAt)) {
        console.warn("[p2p/save] confirmation expired", {
          makerId,
          slug: normalizedSlug,
          expiresAt: confirmation.expiresAt,
          now: new Date().toISOString(),
        });
        await clearTelegramConfirmation(normalizedSlug);
        return res.status(403).json({ ok: false, error: "telegram_confirmation_expired" });
      }

      const confirmedSlug = normalizeTelegramSlug(confirmation.slug).toLowerCase();
      if (!confirmedSlug || confirmedSlug !== normalizedSlug) {
        console.warn("[p2p/save] confirmation slug mismatch", {
          makerId,
          requestSlug: normalizedSlug,
          confirmedSlug,
        });
        return res.status(403).json({ ok: false, error: "telegram_slug_mismatch" });
      }

      confirmationValid = true;
    }
  }

  if (!confirmationValid) {
    const verifyBySlugResponse = await verifyTelegramSlugServer(normalizedSlug);
    const verifiedBySlug = normalizeTelegramSlug(verifyBySlugResponse?.slug).toLowerCase();
    if (verifyBySlugResponse?.ok && verifiedBySlug === normalizedSlug) {
      confirmationValid = true;
    } else {
      console.warn("[p2p/save] confirmation missing", {
        makerId,
        slug: normalizedSlug,
        hasTokenInRequest: Boolean(body.confirmToken),
        verifyBySlugOk: Boolean(verifyBySlugResponse?.ok),
        verifyBySlugSlug: verifiedBySlug || null,
      });
      return res.status(403).json({ ok: false, error: "telegram_confirmation_required" });
    }
  }

  if (!confirmationValid) {
    return res.status(403).json({ ok: false, error: "telegram_confirmation_required" });
  }

  const ownership = await requestStrapiAsService<MakerOwnershipResponse>(
    MAKER_OWNERSHIP_QUERY,
    { id: makerId },
  );
  const makerEntity = ownership?.p2PMaker?.data;
  if (!makerEntity) {
    return res.status(404).json({ ok: false, error: "maker_not_found" });
  }

  const makerTelegramSlug = normalizeTelegramSlug(
    makerEntity.attributes?.telegram_username,
  ).toLowerCase();
  if (!makerTelegramSlug || makerTelegramSlug !== normalizedSlug) {
    console.warn("[p2p/save] maker ownership mismatch", {
      makerId,
      requestSlug: normalizedSlug,
      makerTelegramSlug,
    });
    return res.status(403).json({ ok: false, error: "maker_not_owned_by_slug" });
  }

  const allowedOfferIds = new Set(
    (makerEntity.attributes?.offers?.data || [])
      .map((offer) => offer?.id)
      .filter(Boolean)
      .map((id) => String(id)),
  );

  const makerData: Record<string, any> = {
    status: body.maker?.status,
    telegram_name: body.maker?.telegram_name ?? null,
    description: body.maker?.description ?? null,
  };
  const makerTopParameterIds = normalizeRelationIds(body.maker?.top_parameters);
  if (makerTopParameterIds !== undefined) {
    makerData.top_parameters = makerTopParameterIds;
  }

  if (
    Array.isArray(body.maker?.coordinates) &&
    body.maker?.coordinates.length === 2 &&
    body.maker.coordinates.every((value) => Number.isFinite(value))
  ) {
    const [lat, lng] = body.maker.coordinates;
    makerData.coordinates = `POINT(${lng} ${lat})`;
  }

  Object.keys(makerData).forEach((key) => {
    if (makerData[key] === undefined) delete makerData[key];
  });

  const offerInputs = (body.offers || []).map((offer) => {
    const dir = normalizeDir(
      offer.dir ||
        (offer.givePm?.code && offer.getPm?.code
          ? `${offer.givePm.code}_${offer.getPm.code}`
          : undefined),
    );
    const course = parseNullableNumber(offer.course);
    let min = toNonNegative(parseNullableNumber(offer.min));
    let max = toNonNegative(parseNullableNumber(offer.max));
    if (typeof min === "number" && typeof max === "number" && max < min) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    const topParameterIds = normalizeRelationIds(offer.top_parameters);
    const data: Record<string, any> = {
      dir,
      side: normalizeSide(offer.side),
      isActive: typeof offer.isActive === "boolean" ? offer.isActive : undefined,
      follow_market:
        typeof offer.follow_market === "boolean" ? offer.follow_market : undefined,
      course: typeof course === "number" ? course : course === null ? null : undefined,
      min,
      max,
      fee_type: normalizeFeeType(offer.fee_type),
      fee_amount: parseNullableNumber(offer.fee_amount),
      city_from: normalizeOptionalString(offer.city_from),
      city_to: normalizeOptionalString(offer.city_to),
      top_parameters: topParameterIds,
    };
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) delete data[key];
    });
    return { id: offer.id, data };
  });

  if (
    offerInputs.some(
      (offer) =>
        !offer.data.dir ||
        typeof offer.data.course !== "number" ||
        !Number.isFinite(offer.data.course) ||
        offer.data.course <= 0,
    )
  ) {
    return res.status(400).json({
      ok: false,
      error: "offer_dir_or_course_missing",
    });
  }

  console.log("[p2p/save] prepared offer payload", {
    makerId,
    slug: normalizedSlug,
    offersCount: offerInputs.length,
    sample: offerInputs[0]?.data || null,
  });

  for (const offer of offerInputs) {
    if (!offer.id) continue;
    const offerId = String(offer.id);
    if (!allowedOfferIds.has(offerId)) {
      return res.status(403).json({ ok: false, error: "offer_not_owned_by_maker" });
    }
  }

  try {
    if (Object.keys(makerData).length) {
      await requestStrapiAsService(updateP2PMakerMutation, {
        id: makerId,
        data: makerData,
      });
    }

    const createdOfferIds: string[] = [];
    const existingOfferIds: string[] = [];

    for (const offer of offerInputs) {
      if (offer.id) {
        existingOfferIds.push(String(offer.id));
        await requestStrapiAsService(updateP2POfferMutation, {
          id: offer.id,
          data: offer.data,
        });
        continue;
      }

      const created = await requestStrapiAsService<{
        createP2POffer?: { data?: { id?: string } };
      }>(createP2POfferMutation, {
        data: offer.data,
      });
      const createdId = created?.createP2POffer?.data?.id;
      if (createdId) createdOfferIds.push(String(createdId));
    }

    const allOfferIds = [...existingOfferIds, ...createdOfferIds];
    if (allOfferIds.length) {
      await requestStrapiAsService(updateP2PMakerOffersMutation, {
        id: makerId,
        offers: allOfferIds,
      });

      try {
        const savedOffers = await requestStrapiAsService<OffersAfterSaveResponse>(
          OFFERS_AFTER_SAVE_QUERY,
          { ids: allOfferIds },
        );
        const snapshot =
          savedOffers?.p2POffers?.data?.map((entry) => ({
            id: entry?.id ? String(entry.id) : undefined,
            ...(entry?.attributes || {}),
          })) || [];
        console.log("[p2p/save] strapi saved offers snapshot", {
          makerId,
          slug: normalizedSlug,
          offers: snapshot,
        });
      } catch (snapshotError) {
        console.warn("[p2p/save] failed to read saved offers snapshot", {
          makerId,
          slug: normalizedSlug,
        });
      }
    }

    await clearTelegramConfirmation(normalizedSlug);

    return res.status(200).json({
      ok: true,
      makerId,
      offersLinked: allOfferIds.length,
    });
  } catch (error) {
    console.error("P2P save failed", error);
    return res.status(500).json({ ok: false, error: "save_failed" });
  }
}
