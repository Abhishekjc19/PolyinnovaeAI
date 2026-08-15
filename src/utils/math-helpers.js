/**
 * Mathematical utilities for route optimization and statistical analysis
 * 
 * Includes:
 * - Haversine distance for great circle calculations
 * - Bezier curve generation for smooth route rendering
 * - Statistical functions (confidence intervals, percentiles)
 * - Linear regression helpers
 */

/**
 * Calculate great circle distance between two lat/lng points
 * Uses Haversine formula
 * @returns distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert kilometers to nautical miles
 */
export function kmToNauticalMiles(km) {
  return km * 0.539957;
}

/**
 * Quadratic Bezier curve generator
 * Useful for smooth route visualization
 */
export function generateBezierCurve(p0, p1, p2, numPoints = 30) {
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    points.push({ x, y });
  }

  return points;
}

/**
 * Cubic Bezier for more complex curves
 */
export function generateCubicBezier(p0, p1, p2, p3, numPoints = 40) {
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;
    const y =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y;
    points.push({ x, y });
  }

  return points;
}

/**
 * Calculate percentile from sorted array
 */
export function percentile(arr, p) {
  if (arr.length === 0) return 0;
  if (p <= 0) return arr[0];
  if (p >= 100) return arr[arr.length - 1];

  const index = (p / 100) * (arr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

/**
 * Simple linear regression: y = mx + b
 * Returns slope (m) and intercept (b)
 */
export function linearRegression(xValues, yValues) {
  const n = xValues.length;
  if (n !== yValues.length || n === 0) {
    throw new Error('Input arrays must have same non-zero length');
  }

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  const ssRes = yValues.reduce((sum, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const rSquared = 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

/**
 * Calculate exponential moving average
 * Used for price smoothing and trend detection
 */
export function exponentialMovingAverage(data, alpha = 0.3) {
  if (data.length === 0) return [];

  const ema = [data[0]];

  for (let i = 1; i < data.length; i++) {
    ema.push(alpha * data[i] + (1 - alpha) * ema[i - 1]);
  }

  return ema;
}

/**
 * Standard deviation
 */
export function standardDeviation(values) {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Confidence interval calculation (assuming normal distribution)
 */
export function confidenceInterval(data, confidence = 0.95) {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = standardDeviation(data);
  const n = data.length;

  // Z-score for 95% confidence ≈ 1.96
  const zScores = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidence] || 1.96;
  const margin = z * (stdDev / Math.sqrt(n));

  return {
    mean,
    lower: mean - margin,
    upper: mean + margin,
    stdDev,
  };
}

/**
 * Normalize value to 0-1 range
 */
export function normalize(value, min, max) {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Exponential decay function
 * Useful for modeling price normalization after shock
 */
export function exponentialDecay(initial, rate, time) {
  return initial * Math.exp(-rate * time);
}

/**
 * Logistic growth function
 * S-curve useful for adoption/transition modeling
 */
export function logistic(t, L, k, t0) {
  // L: carrying capacity (max value)
  // k: growth rate
  // t0: midpoint
  return L / (1 + Math.exp(-k * (t - t0)));
}
