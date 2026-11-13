// Shared helpers for the /api/cars, /api/motorcycles and /api/trucks list endpoints.

const MAX_LIMIT = 1000;

// Only these fields may be used for sorting (prevents sorting by arbitrary user input).
const SORTABLE_FIELDS = ['_id', 'price_eur', 'mileage_km', 'first_registration', 'createdAt'];

/** Escapes regex special characters so user input is matched literally. */
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive "contains" match for text filters. */
const containsRegex = (text) => new RegExp(escapeRegex(text), 'i');

/** Case-insensitive exact match (e.g. make names from a dropdown). */
const exactRegex = (text) => new RegExp(`^${escapeRegex(text)}$`, 'i');

/** Converts a query value to a number; undefined for missing, empty or invalid values. */
const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

/** Builds { $gte, $lte } or returns undefined when both bounds are missing. */
const buildRange = (min, max) => {
    if (min === undefined && max === undefined) return undefined;
    const range = {};
    if (min !== undefined) range.$gte = min;
    if (max !== undefined) range.$lte = max;
    return range;
};

/**
 * Adds a range condition to filter[field], merging with an existing one.
 */
const addRange = (filter, field, min, max) => {
    const range = buildRange(min, max);
    if (!range) return;
    filter[field] = { ...(filter[field] || {}), ...range };
};

/**
 * Supports the parameters the frontend sends for recommendations:
 * first_registration_gte, mileage_km_lte, price_eur_lte (and the other _gte/_lte variants).
 */
const applyPreferenceRanges = (filter, query, fields) => {
    fields.forEach((field) => {
        addRange(filter, field, toNumber(query[`${field}_gte`]), toNumber(query[`${field}_lte`]));
    });
};

/**
 * Applies ?sort=-field and ?limit=N to a Mongoose query.
 * Without limit the full result is returned (as before).
 */
const applyListOptions = (mongooseQuery, query) => {
    if (typeof query.sort === 'string' && query.sort) {
        const desc = query.sort.startsWith('-');
        const field = desc ? query.sort.slice(1) : query.sort;
        if (SORTABLE_FIELDS.includes(field)) mongooseQuery.sort({ [field]: desc ? -1 : 1 });
    }

    const limit = toNumber(query.limit);
    if (limit !== undefined && limit > 0) {
        mongooseQuery.limit(Math.min(Math.floor(limit), MAX_LIMIT));
    }

    return mongooseQuery;
};

module.exports = {
    escapeRegex,
    containsRegex,
    exactRegex,
    toNumber,
    buildRange,
    addRange,
    applyPreferenceRanges,
    applyListOptions,
};