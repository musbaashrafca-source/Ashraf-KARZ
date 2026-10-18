import heroFleet from '../assets/images/hero_uae_luxury_fleet_1791627589055.jpg';
import landCruiser from '../assets/images/car_toyota_landcruiser_1791627598999.jpg';
import nissanPatrol from '../assets/images/car_nissan_patrol_1791627609906.jpg';
import porscheMacan from '../assets/images/car_porsche_macan_1791627620284.jpg';
import mercedesG63 from '../assets/images/car_mercedes_g63_1791627629650.jpg';

export const ASSET_IMAGES = {
  heroFleet,
  landCruiser,
  nissanPatrol,
  porscheMacan,
  mercedesG63,
};

export function getVehicleImage(vehicle?: { make?: string; model?: string; photos?: string[] } | null): string {
  if (!vehicle) return heroFleet;

  const photo = vehicle.photos && vehicle.photos[0] ? vehicle.photos[0].trim() : '';

  // 1. If photo is a direct web URL or data URI, return it directly
  if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:image/')) {
    return photo;
  }

  // 2. If photo references one of the bundled asset paths, resolve to the imported module
  if (photo.includes('car_toyota_landcruiser')) return landCruiser;
  if (photo.includes('car_nissan_patrol')) return nissanPatrol;
  if (photo.includes('car_porsche_macan')) return porscheMacan;
  if (photo.includes('car_mercedes_g63')) return mercedesG63;
  if (photo.includes('hero_uae_luxury_fleet')) return heroFleet;

  // 3. Fallback based on vehicle model
  const modelStr = `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase();

  if (modelStr.includes('land cruiser') || modelStr.includes('prado') || modelStr.includes('toyota')) {
    return landCruiser;
  }
  if (modelStr.includes('patrol') || modelStr.includes('nissan') || modelStr.includes('safari')) {
    return nissanPatrol;
  }
  if (modelStr.includes('macan') || modelStr.includes('porsche') || modelStr.includes('cayenne') || modelStr.includes('911')) {
    return porscheMacan;
  }
  if (modelStr.includes('g63') || modelStr.includes('g-class') || modelStr.includes('mercedes') || modelStr.includes('amg')) {
    return mercedesG63;
  }

  // Fallback to high-res luxury showroom hero fleet
  return heroFleet;
}

