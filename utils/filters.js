/**
 * Parses query params for filtering models, e.g. price ranges, date ranges, statuses.
 * Extend this as per your models.
 */
function buildFilters(query) {
  const filters = {};

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  if (query.startDate || query.endDate) {
    filters.createdAt = {};
    if (query.startDate) filters.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filters.createdAt.$lte = new Date(query.endDate);
  }

  if (query.status) {
    filters.status = query.status;
  }

  // Add more fields as needed...

  return filters;
}

module.exports = { buildFilters };
