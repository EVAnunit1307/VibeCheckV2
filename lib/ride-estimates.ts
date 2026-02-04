// Ride cost estimation utility for night out planning

interface Location {
  latitude: number;
  longitude: number;
}

// Calculate distance using Haversine formula
function calculateDistance(from: Location, to: Location): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Estimate ride costs based on distance and time of day
export function estimateRideCost(
  userLocation: Location,
  venueLocation: Location,
  eventTime?: Date
): { uber: number; lyft: number; average: number } {
  const distance = calculateDistance(userLocation, venueLocation);
  
  // Base rates (approximate)
  const baseFare = 2.5;
  const perMile = 1.75;
  const perMinute = 0.35;
  
  // Estimate travel time (assume 30 mph average in city)
  const estimatedMinutes = (distance / 30) * 60;
  
  // Calculate base cost
  let baseCost = baseFare + (distance * perMile) + (estimatedMinutes * perMinute);
  
  // Apply surge pricing based on time (night out hours)
  let surgeMultiplier = 1.0;
  
  if (eventTime) {
    const hour = eventTime.getHours();
    const day = eventTime.getDay();
    
    // Friday/Saturday night surge
    if ((day === 5 || day === 6) && (hour >= 21 || hour <= 3)) {
      surgeMultiplier = 1.8;
    }
    // Other weekend nights
    else if ((day === 5 || day === 6) && hour >= 18) {
      surgeMultiplier = 1.4;
    }
    // Weeknight prime time
    else if (hour >= 17 && hour <= 20) {
      surgeMultiplier = 1.3;
    }
    // Late night weekdays
    else if (hour >= 22 || hour <= 3) {
      surgeMultiplier = 1.5;
    }
  }
  
  baseCost *= surgeMultiplier;
  
  // Add realistic variance between services
  const uber = Math.round(baseCost * 1.05 * 100) / 100;
  const lyft = Math.round(baseCost * 0.95 * 100) / 100;
  const average = Math.round(((uber + lyft) / 2) * 100) / 100;
  
  return {
    uber,
    lyft,
    average: Math.min(average, 50), // Cap at $50 for display
  };
}

// Get ride estimate for display
export function getRideEstimateText(cost: number): string {
  if (cost < 10) return `~$${cost.toFixed(0)}`;
  return `$${Math.floor(cost / 5) * 5}-${Math.ceil(cost / 5) * 5}`;
}

// Calculate total night out cost estimate
export function estimateNightOutCost(
  eventPrice: number,
  rideCost: number,
  estimatedDrinks: number = 3,
  averageDrinkPrice: number = 12
): {
  entry: number;
  rides: number;
  drinks: number;
  total: number;
  perPerson: number;
} {
  const entry = eventPrice;
  const rides = rideCost * 2; // Round trip
  const drinks = estimatedDrinks * averageDrinkPrice;
  const total = entry + rides + drinks;
  
  return {
    entry,
    rides,
    drinks,
    total,
    perPerson: total,
  };
}
