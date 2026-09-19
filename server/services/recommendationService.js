/**
 * RentEase AI - preference based smart recommendation engine.
 *
 * This is a transparent, explainable scoring engine (not a trained ML model).
 * Every property is scored out of 100 against the tenant's saved preferences:
 *
 *   Budget match      30
 *   Location match    25
 *   Property type     15
 *   Room type         10
 *   Amenities         10
 *   Food preference    5
 *   Property rating    5
 *
 * The scoring rules live in one place so an LLM/ML service can replace
 * `scoreProperty` later without touching controllers or routes.
 */

const WEIGHTS = {
  budget: 30,
  location: 25,
  propertyType: 15,
  roomType: 10,
  amenities: 10,
  food: 5,
  rating: 5
};

const normalize = (value) => String(value || '').trim().toLowerCase();

/** Scores a single property against a tenant's preferences. */
const scoreProperty = (property, preferences = {}) => {
  let score = 0;
  const reasons = [];

  // 1. Budget (30)
  const maxRent = Number(preferences.maxRent) || 0;
  const minRent = Number(preferences.minRent) || 0;
  if (maxRent > 0) {
    if (property.rent <= maxRent && property.rent >= minRent) {
      score += WEIGHTS.budget;
      reasons.push('Within your preferred budget');
    } else if (property.rent < minRent) {
      score += WEIGHTS.budget * 0.8;
      reasons.push('Cheaper than your budget range');
    } else if (property.rent <= maxRent * 1.1) {
      score += WEIGHTS.budget * 0.6;
      reasons.push('Just above your budget (within 10%)');
    } else if (property.rent <= maxRent * 1.25) {
      score += WEIGHTS.budget * 0.3;
      reasons.push('Around 25% above your budget');
    }
  } else {
    score += WEIGHTS.budget * 0.5;
  }

  // 2. Location (25) - city is worth more than locality
  const cityMatch = preferences.preferredCity && normalize(preferences.preferredCity) === normalize(property.city);
  const localityMatch =
    preferences.preferredLocality &&
    normalize(property.locality).includes(normalize(preferences.preferredLocality));
  if (cityMatch) {
    score += 16;
    reasons.push(`Located in ${property.city}, your preferred city`);
  }
  if (localityMatch) {
    score += 9;
    reasons.push(`Close to ${property.locality}, your preferred locality`);
  }
  if (!preferences.preferredCity && !preferences.preferredLocality) {
    score += WEIGHTS.location * 0.4;
  }

  // 3. Property type (15)
  if (!preferences.propertyType || preferences.propertyType === 'Any') {
    score += WEIGHTS.propertyType * 0.5;
  } else if (preferences.propertyType === property.propertyType) {
    score += WEIGHTS.propertyType;
    reasons.push(`Matches your preferred property type (${property.propertyType})`);
  }

  // 4. Room type (10)
  if (!preferences.roomType || preferences.roomType === 'Any') {
    score += WEIGHTS.roomType * 0.5;
  } else if (preferences.roomType === property.roomType) {
    score += WEIGHTS.roomType;
    reasons.push(`Matches your preferred room type (${property.roomType})`);
  }

  // 5. Amenities (10)
  const wanted = preferences.requiredAmenities || [];
  if (wanted.length) {
    const available = (property.amenities || []).map(normalize);
    const matched = wanted.filter((a) => available.includes(normalize(a)));
    score += (matched.length / wanted.length) * WEIGHTS.amenities;
    if (matched.length) {
      reasons.push(`Contains ${matched.length} of your ${wanted.length} requested amenities`);
    }
  } else {
    score += WEIGHTS.amenities * 0.5;
  }

  // 6. Food preference (5)
  if (preferences.foodRequired) {
    if (property.foodAvailable) {
      score += WEIGHTS.food;
      reasons.push('Meals are included');
    }
  } else {
    score += WEIGHTS.food * 0.5;
  }

  // 7. Rating (5)
  if (property.rating > 0) {
    score += (property.rating / 5) * WEIGHTS.rating;
    if (property.rating >= 4) reasons.push(`Highly rated by tenants (${property.rating.toFixed(1)}/5)`);
  }

  // Gender preference is a hard filter rather than a score, but worth explaining.
  if (
    preferences.genderPreference &&
    preferences.genderPreference !== 'Any' &&
    property.genderPreference === preferences.genderPreference
  ) {
    reasons.push(`Open to ${property.genderPreference} tenants`);
  }

  if (!reasons.length) reasons.push('A reasonable all-round option in your search area');

  return {
    matchScore: Math.max(0, Math.min(100, Math.round(score))),
    reasons: reasons.slice(0, 6)
  };
};

/** Scores and ranks a list of properties. */
const rankProperties = (properties, preferences, limit = 12) =>
  properties
    .map((property) => {
      const plain = typeof property.toObject === 'function' ? property.toObject() : property;
      const { matchScore, reasons } = scoreProperty(plain, preferences);
      return { property: plain, matchScore, reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

module.exports = { scoreProperty, rankProperties, WEIGHTS };
