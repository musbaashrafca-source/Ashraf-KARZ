import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DEALERS_FILE = path.join(DATA_DIR, 'dealers.json');
const VEHICLES_FILE = path.join(DATA_DIR, 'vehicles.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static images and assets directly
app.use('/src/assets', express.static(path.resolve(__dirname, 'src/assets')));
app.use('/assets', express.static(path.resolve(__dirname, 'public/assets')));
app.use(express.static(path.resolve(__dirname, 'public')));

// Helper to read data
function getDealers() {
  if (fs.existsSync(DEALERS_FILE)) {
    return JSON.parse(fs.readFileSync(DEALERS_FILE, 'utf-8'));
  }
  return [];
}

function saveDealers(data: any[]) {
  fs.writeFileSync(DEALERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getVehicles() {
  if (fs.existsSync(VEHICLES_FILE)) {
    return JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf-8'));
  }
  return [];
}

function saveVehicles(data: any[]) {
  fs.writeFileSync(VEHICLES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getAlerts() {
  if (fs.existsSync(ALERTS_FILE)) {
    return JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf-8'));
  }
  return [];
}

function saveAlerts(data: any[]) {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function evaluateAlerts(alerts: any[], vehicles: any[]) {
  let updated = false;
  alerts.forEach((alert: any) => {
    const v = vehicles.find((veh: any) => veh.id === alert.vehicle_id);
    if (v) {
      alert.current_price_aed = v.price_aed;
      if (alert.status === 'active' && v.price_aed <= alert.target_price_aed) {
        alert.status = 'triggered';
        alert.triggered_at = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GST';
        alert.triggered_price_aed = v.price_aed;
        updated = true;
      }
    }
  });
  if (updated) {
    saveAlerts(alerts);
  }
  return alerts;
}

// ---------------------------------------------
// REST API ROUTES
// ---------------------------------------------

// 1. Dealers API
app.get('/api/dealers', (req, res) => {
  try {
    const dealers = getDealers();
    res.json({ success: true, dealers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dealers', (req, res) => {
  try {
    const dealers = getDealers();
    const newDealer = {
      ...req.body,
      id: req.body.id || `dealer-${Date.now()}`,
      is_active: req.body.is_active ?? true,
      last_updated: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GST',
      total_listings: 0
    };
    dealers.push(newDealer);
    saveDealers(dealers);
    res.status(201).json({ success: true, dealer: newDealer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/dealers/:id', (req, res) => {
  try {
    const dealers = getDealers();
    const idx = dealers.findIndex((d: any) => d.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Dealer not found' });
    }
    dealers[idx] = { ...dealers[idx], ...req.body };
    saveDealers(dealers);
    res.json({ success: true, dealer: dealers[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Vehicles Inventory API with Search, Filter & Sort
app.get('/api/vehicles', (req, res) => {
  try {
    let vehicles = getVehicles();
    const {
      search,
      make,
      model,
      dealerId,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      maxMileage,
      specification,
      fuelType,
      bodyType,
      warrantyOnly,
      serviceOnly,
      inspectionOnly,
      sortBy
    } = req.query as Record<string, string>;

    // Search query
    if (search) {
      const q = search.toLowerCase();
      vehicles = vehicles.filter((v: any) =>
        `${v.make} ${v.model} ${v.variant} ${v.vin} ${v.dealer_name}`.toLowerCase().includes(q)
      );
    }

    if (make) {
      vehicles = vehicles.filter((v: any) => v.make.toLowerCase() === make.toLowerCase());
    }

    if (model) {
      vehicles = vehicles.filter((v: any) => v.model.toLowerCase() === model.toLowerCase());
    }

    if (dealerId && dealerId !== 'all') {
      vehicles = vehicles.filter((v: any) => v.dealer_id === dealerId);
    }

    if (minPrice) {
      vehicles = vehicles.filter((v: any) => v.price_aed >= parseFloat(minPrice));
    }

    if (maxPrice) {
      vehicles = vehicles.filter((v: any) => v.price_aed <= parseFloat(maxPrice));
    }

    if (minYear) {
      vehicles = vehicles.filter((v: any) => v.year >= parseInt(minYear));
    }

    if (maxYear) {
      vehicles = vehicles.filter((v: any) => v.year <= parseInt(maxYear));
    }

    if (maxMileage) {
      vehicles = vehicles.filter((v: any) => v.mileage_km <= parseInt(maxMileage));
    }

    if (specification && specification !== 'all') {
      vehicles = vehicles.filter((v: any) => v.specification === specification);
    }

    if (fuelType && fuelType !== 'all') {
      vehicles = vehicles.filter((v: any) => v.fuel_type === fuelType);
    }

    if (bodyType && bodyType !== 'all') {
      vehicles = vehicles.filter((v: any) => v.body_type === bodyType);
    }

    if (warrantyOnly === 'true') {
      vehicles = vehicles.filter((v: any) => v.warranty_available);
    }

    if (serviceOnly === 'true') {
      vehicles = vehicles.filter((v: any) => v.service_history_disclosed);
    }

    if (inspectionOnly === 'true') {
      vehicles = vehicles.filter((v: any) => v.inspection_report_available);
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        vehicles.sort((a: any, b: any) => a.price_aed - b.price_aed);
        break;
      case 'price_desc':
        vehicles.sort((a: any, b: any) => b.price_aed - a.price_aed);
        break;
      case 'mileage_asc':
        vehicles.sort((a: any, b: any) => a.mileage_km - b.mileage_km);
        break;
      case 'year_desc':
        vehicles.sort((a: any, b: any) => b.year - a.year);
        break;
      case 'discount_desc':
        vehicles.sort((a: any, b: any) => (b.original_price_aed - b.price_aed) - (a.original_price_aed - a.price_aed));
        break;
      case 'completeness_desc':
        vehicles.sort((a: any, b: any) => b.data_completeness_pct - a.data_completeness_pct);
        break;
      case 'recent_listed':
      default:
        vehicles.sort((a: any, b: any) => new Date(b.listing_date).getTime() - new Date(a.listing_date).getTime());
        break;
    }

    res.json({
      success: true,
      total: vehicles.length,
      vehicles
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Vehicle by ID with Cross-Dealer Benchmark
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicles = getVehicles();
    const vehicle = vehicles.find((v: any) => v.id === req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Benchmark calculation
    const comps = vehicles.filter(
      (v: any) =>
        v.make.toLowerCase() === vehicle.make.toLowerCase() &&
        v.model.toLowerCase() === vehicle.model.toLowerCase() &&
        Math.abs(v.year - vehicle.year) <= 1
    );

    const prices = comps.map((c: any) => c.price_aed);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || vehicle.price_aed;
    const minPrice = sortedPrices[0] || vehicle.price_aed;
    const maxPrice = sortedPrices[sortedPrices.length - 1] || vehicle.price_aed;
    const avgPrice = Math.round(prices.reduce((s: number, p: number) => s + p, 0) / (prices.length || 1));

    const deltaFromMedian = vehicle.price_aed - medianPrice;
    const pctFromMedian = Math.round((deltaFromMedian / (medianPrice || 1)) * 1000) / 10;

    const benchmark = {
      comparable_count: comps.length,
      median_advertised_price_aed: medianPrice,
      average_advertised_price_aed: avgPrice,
      min_advertised_price_aed: minPrice,
      max_advertised_price_aed: maxPrice,
      target_price_aed: vehicle.price_aed,
      delta_from_median_aed: deltaFromMedian,
      pct_from_median: pctFromMedian,
      dealers_represented: Array.from(new Set(comps.map((c: any) => c.dealer_name))),
      reduced_comparables_count: comps.filter((c: any) => c.original_price_aed > c.price_aed).length,
      price_position_label:
        pctFromMedian < -3
          ? 'Below Market Median (Competitive)'
          : pctFromMedian > 3
          ? 'Above Market Median (Premium/High Spec)'
          : 'At Market Median',
      disclaimer: 'Important: Advertised asking prices may differ from closed transaction prices after dealer negotiation.'
    };

    res.json({ success: true, vehicle, benchmark });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Comparison & Suitability Scoring API (2 to 5 vehicles)
app.post('/api/compare', (req, res) => {
  try {
    const { vehicleIds, weights } = req.body;
    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length < 2 || vehicleIds.length > 5) {
      return res.status(400).json({ success: false, error: 'Provide between 2 and 5 vehicle IDs' });
    }

    const allVehicles = getVehicles();
    const selectedVehicles = allVehicles.filter((v: any) => vehicleIds.includes(v.id));

    if (selectedVehicles.length < 2) {
      return res.status(400).json({ success: false, error: 'Could not find at least 2 matching vehicles' });
    }

    const defaultWeights = {
      price: 25,
      mileage: 20,
      year: 15,
      warranty: 15,
      service_history: 15,
      completeness: 10
    };
    const w = { ...defaultWeights, ...(weights || {}) };
    const totalW = (w.price + w.mileage + w.year + w.warranty + w.service_history + w.completeness) || 100;

    const scoredVehicles = selectedVehicles.map((v: any) => {
      // 1. Price score
      const comps = allVehicles.filter((other: any) => other.make === v.make && other.model === v.model);
      let priceScore = 75;
      if (comps.length > 1) {
        const sorted = comps.map((c: any) => c.price_aed).sort((a: number, b: number) => a - b);
        const med = sorted[Math.floor(sorted.length / 2)];
        const deltaPct = ((v.price_aed - med) / med) * 100;
        priceScore = Math.max(20, Math.min(100, 75 - deltaPct * 1.5));
      }

      // 2. Mileage score
      const carAge = Math.max(1, 2026 - v.year);
      const annualKm = v.mileage_km / carAge;
      let mileageScore = 70;
      if (annualKm <= 12000) mileageScore = 95;
      else if (annualKm <= 18000) mileageScore = 85;
      else if (annualKm <= 25000) mileageScore = 70;
      else if (annualKm <= 35000) mileageScore = 50;
      else mileageScore = 30;

      // 3. Year score
      const age = 2026 - v.year;
      let yearScore = Math.max(25, 95 - age * 12);

      // 4. Warranty score
      let warrantyScore = 0;
      if (v.warranty_available) {
        let base = 60;
        if (v.warranty_duration_months >= 36) base = 95;
        else if (v.warranty_duration_months >= 24) base = 88;
        else if (v.warranty_duration_months >= 12) base = 75;

        if (v.warranty_coverage?.includes('Comprehensive') || v.warranty_provider?.includes('Agency')) {
          warrantyScore = Math.min(100, base + 5);
        } else {
          warrantyScore = base;
        }
      }

      // 5. Service & accident disclosure score
      let serviceScore = 0;
      if (v.service_history_disclosed) {
        if (v.service_history_type?.includes('Full Agency')) serviceScore += 55;
        else if (v.service_history_type?.includes('Partial')) serviceScore += 35;
        else serviceScore += 20;
      }
      if (v.accident_history_disclosed) {
        if (v.accident_status?.includes('Clean')) serviceScore += 45;
        else if (v.accident_status?.includes('Minor')) serviceScore += 25;
        else serviceScore += 10;
      }
      if (v.specification !== 'GCC') {
        serviceScore = Math.max(10, serviceScore - 20);
      }

      // 6. Completeness
      const completenessScore = v.data_completeness_pct || 70;

      const overall =
        (priceScore * w.price +
          mileageScore * w.mileage +
          yearScore * w.year +
          warrantyScore * w.warranty +
          serviceScore * w.service_history +
          completenessScore * w.completeness) /
        totalW;

      return {
        vehicle: v,
        suitability: {
          overall_score: Math.round(overall * 10) / 10,
          breakdown: {
            price_score: Math.round(priceScore * 10) / 10,
            mileage_score: Math.round(mileageScore * 10) / 10,
            year_score: Math.round(yearScore * 10) / 10,
            warranty_score: Math.round(warrantyScore * 10) / 10,
            service_score: Math.round(serviceScore * 10) / 10,
            completeness_score: Math.round(completenessScore * 10) / 10
          },
          applied_weights: w,
          explanation: `Score computed from ${w.price}% price, ${w.mileage}% mileage freshness, ${w.year}% year recency, ${w.warranty}% warranty, ${w.service_history}% agency disclosures, and ${w.completeness}% data completeness. Missing items penalized.`
        }
      };
    });

    // Sort descending by suitability score
    scoredVehicles.sort((a: any, b: any) => b.suitability.overall_score - a.suitability.overall_score);

    res.json({
      success: true,
      comparison: scoredVehicles,
      best_value_id: scoredVehicles[0]?.vehicle.id
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Market Overview API
app.get('/api/market-overview', (req, res) => {
  try {
    const vehicles = getVehicles();
    const prices = vehicles.map((v: any) => v.price_aed);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mileages = vehicles.map((v: any) => v.mileage_km);

    const dealerCounts: Record<string, number> = {};
    const makeCounts: Record<string, number> = {};
    const bodyCounts: Record<string, number> = {};
    const fuelCounts: Record<string, number> = {};

    vehicles.forEach((v: any) => {
      dealerCounts[v.dealer_name] = (dealerCounts[v.dealer_name] || 0) + 1;
      makeCounts[v.make] = (makeCounts[v.make] || 0) + 1;
      bodyCounts[v.body_type] = (bodyCounts[v.body_type] || 0) + 1;
      fuelCounts[v.fuel_type] = (fuelCounts[v.fuel_type] || 0) + 1;
    });

    const gccCount = vehicles.filter((v: any) => v.specification === 'GCC').length;
    const warrantyCount = vehicles.filter((v: any) => v.warranty_available).length;
    const reducedVehicles = vehicles.filter((v: any) => v.original_price_aed > v.price_aed);
    const totalSavings = reducedVehicles.reduce(
      (s: number, v: any) => s + (v.original_price_aed - v.price_aed),
      0
    );

    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;
    const avgPrice = Math.round(prices.reduce((s: number, p: number) => s + p, 0) / (prices.length || 1));
    const avgMileage = Math.round(mileages.reduce((s: number, m: number) => s + m, 0) / (mileages.length || 1));

    res.json({
      success: true,
      data: {
        total_vehicles: vehicles.length,
        median_price_aed: medianPrice,
        average_price_aed: avgPrice,
        min_price_aed: sortedPrices[0] || 0,
        max_price_aed: sortedPrices[sortedPrices.length - 1] || 0,
        average_mileage_km: avgMileage,
        gcc_spec_count: gccCount,
        imported_spec_count: vehicles.length - gccCount,
        gcc_spec_pct: Math.round((gccCount / (vehicles.length || 1)) * 1000) / 10,
        warranty_available_count: warrantyCount,
        warranty_available_pct: Math.round((warrantyCount / (vehicles.length || 1)) * 1000) / 10,
        price_reductions_count: reducedVehicles.length,
        total_price_savings_aed: totalSavings,
        dealer_breakdown: dealerCounts,
        make_breakdown: makeCounts,
        fuel_breakdown: fuelCounts,
        body_type_breakdown: bodyCounts
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Trending & Market Movement API
app.get('/api/trending', (req, res) => {
  try {
    const vehicles = getVehicles();
    const period = req.query.period || '30d';

    // Model aggregation
    const modelMap: Record<string, { make: string; model: string; listings: number; dealers: Set<string>; priceDrops: number; prices: number[] }> = {};

    vehicles.forEach((v: any) => {
      const key = `${v.make} ${v.model}`;
      if (!modelMap[key]) {
        modelMap[key] = {
          make: v.make,
          model: v.model,
          listings: 0,
          dealers: new Set(),
          priceDrops: 0,
          prices: []
        };
      }
      modelMap[key].listings += 1;
      modelMap[key].dealers.add(v.dealer_name);
      if (v.original_price_aed > v.price_aed) {
        modelMap[key].priceDrops += 1;
      }
      modelMap[key].prices.push(v.price_aed);
    });

    const modelTrends = Object.entries(modelMap).map(([key, data]) => {
      const sorted = [...data.prices].sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      return {
        model_name: key,
        make: data.make,
        model: data.model,
        listings_count: data.listings,
        dealers_count: data.dealers.size,
        dealers_list: Array.from(data.dealers),
        price_reductions_count: data.priceDrops,
        median_price_aed: med,
        growth_indicator: data.listings >= 3 ? '+14% listing growth' : '+5% listing growth'
      };
    });

    modelTrends.sort((a, b) => b.listings_count - a.listings_count);

    res.json({
      success: true,
      period,
      disclaimer:
        'Market Intelligence Notice: High listing count represents dealer inventory supply and stocking behavior, NOT necessarily high buyer demand or fast velocity.',
      trending_models: modelTrends,
      top_price_drops: vehicles
        .filter((v: any) => v.original_price_aed > v.price_aed)
        .sort((a: any, b: any) => (b.original_price_aed - b.price_aed) - (a.original_price_aed - a.price_aed))
        .slice(0, 5)
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6a. Live Inventory Feed Synchronization API
app.post('/api/sync-live-inventory', (req, res) => {
  exec('python3 python_engine/live_sync.py', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    try {
      const dealers = getDealers();
      const vehicles = getVehicles();
      const lastUpdated = dealers[0]?.last_updated || '18 Oct 2026 16:10 GST';

      res.json({
        success: true,
        last_updated: lastUpdated,
        total_vehicles: vehicles.length,
        total_dealers: dealers.length,
        message: 'Successfully synchronized live inventory across Al-Futtaim, CARS24, Kavak, CarSwitch, and The Elite Cars.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
});

// 6b. Price Drop Alerts API
app.get('/api/alerts', (req, res) => {
  try {
    const rawAlerts = getAlerts();
    const vehicles = getVehicles();
    const alerts = evaluateAlerts(rawAlerts, vehicles);
    const triggeredCount = alerts.filter((a: any) => a.status === 'triggered').length;
    res.json({ success: true, alerts, triggeredCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/alerts', (req, res) => {
  try {
    const { vehicleId, targetPriceAed, userEmail } = req.body;
    if (!vehicleId || !targetPriceAed) {
      return res.status(400).json({ success: false, error: 'vehicleId and targetPriceAed are required' });
    }

    const vehicles = getVehicles();
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const alerts = getAlerts();
    const existingIndex = alerts.findIndex((a: any) => a.vehicle_id === vehicleId);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GST';
    const numericTarget = parseFloat(targetPriceAed);
    const isTriggered = vehicle.price_aed <= numericTarget;

    const alertObj = {
      id: existingIndex >= 0 ? alerts[existingIndex].id : `alert-${Date.now()}`,
      vehicle_id: vehicle.id,
      vehicle_title: `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.variant})`,
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
      vehicle_year: vehicle.year,
      dealer_name: vehicle.dealer_name,
      initial_price_aed: vehicle.price_aed,
      current_price_aed: vehicle.price_aed,
      target_price_aed: numericTarget,
      user_email: userEmail || 'buyer@karz4u.ae',
      created_at: now,
      status: isTriggered ? 'triggered' : 'active',
      triggered_at: isTriggered ? now : undefined,
      triggered_price_aed: isTriggered ? vehicle.price_aed : undefined
    };

    if (existingIndex >= 0) {
      alerts[existingIndex] = alertObj;
    } else {
      alerts.unshift(alertObj);
    }

    saveAlerts(alerts);
    res.json({
      success: true,
      alert: alertObj,
      message: isTriggered ? 'Target price met immediately!' : 'Price alert registered successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/alerts/:id', (req, res) => {
  try {
    let alerts = getAlerts();
    alerts = alerts.filter((a: any) => a.id !== req.params.id);
    saveAlerts(alerts);
    res.json({ success: true, message: 'Alert removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/alerts/:id/dismiss', (req, res) => {
  try {
    const alerts = getAlerts();
    const alert = alerts.find((a: any) => a.id === req.params.id);
    if (alert) {
      alert.status = 'dismissed';
      saveAlerts(alerts);
    }
    res.json({ success: true, alert });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Utility to simulate price drop for testing target price triggers
app.post('/api/alerts/simulate-drop', (req, res) => {
  try {
    const { vehicleId, dropAmount, targetPrice } = req.body;
    const vehicles = getVehicles();
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const previousPrice = vehicle.price_aed;
    const newPrice = targetPrice
      ? parseFloat(targetPrice)
      : Math.max(10000, previousPrice - (parseFloat(dropAmount) || 12000));
    vehicle.price_aed = newPrice;
    const today = new Date().toISOString().substring(0, 10);
    vehicle.price_history.push({
      date: today,
      price_aed: newPrice,
      note: `Price reduction observed (-AED ${(previousPrice - newPrice).toLocaleString()})`
    });
    vehicle.last_observed_date = today;
    saveVehicles(vehicles);

    // Evaluate alerts
    const alerts = getAlerts();
    const evaluated = evaluateAlerts(alerts, vehicles);
    const triggered = evaluated.filter(
      (a: any) => a.vehicle_id === vehicleId && a.status === 'triggered'
    );

    res.json({
      success: true,
      vehicle,
      previousPrice,
      newPrice,
      triggeredAlerts: triggered,
      message: `Price drop applied to ${vehicle.make} ${vehicle.model}: AED ${previousPrice.toLocaleString()} -> AED ${newPrice.toLocaleString()}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Run Python CLI directly and stream back terminal output
app.post('/api/run-python', (req, res) => {
  const { action, make, dealer, ids } = req.body;
  let cmd = `python3 python_engine/cli.py --action ${action || 'summary'}`;

  if (make) cmd += ` --make "${make.replace(/"/g, '')}"`;
  if (dealer) cmd += ` --dealer "${dealer.replace(/"/g, '')}"`;
  if (ids && Array.isArray(ids) && ids.length) {
    cmd += ` --ids ${ids.join(' ')}`;
  }

  exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.json({
        success: false,
        command: cmd,
        output: stderr || error.message
      });
    }
    res.json({
      success: true,
      command: cmd,
      output: stdout
    });
  });
});

// 8. Import CSV API
app.post('/api/import-csv', (req, res) => {
  try {
    const { dealerId, csvContent } = req.body;
    if (!dealerId || !csvContent) {
      return res.status(400).json({ success: false, error: 'dealerId and csvContent are required' });
    }

    const tmpFile = path.join(DATA_DIR, `temp_import_${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, csvContent, 'utf-8');

    // Run python ingestion script
    const pyScript = `
import sys
import os
sys.path.insert(0, os.path.abspath('.'))
from python_engine.aggregator import AggregatorEngine

engine = AggregatorEngine()
with open('${tmpFile}', 'r') as f:
    res = engine.import_csv_feed('${dealerId}', f.read(), is_demo=False)
import json
print(json.dumps(res))
`;

    exec(`python3 -c "${pyScript.replace(/\n/g, ' ')}"`, { cwd: __dirname }, (error, stdout, stderr) => {
      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch (e) {}

      if (error) {
        return res.status(500).json({ success: false, error: stderr || error.message });
      }

      try {
        const parsedResult = JSON.parse(stdout.trim());
        res.json({ success: true, result: parsedResult });
      } catch (e) {
        res.json({ success: true, output: stdout.trim() });
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Export API
app.get('/api/export/:format', (req, res) => {
  try {
    const vehicles = getVehicles();
    const format = req.params.format;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="uae_preowned_inventory.json"');
      return res.send(JSON.stringify(vehicles, null, 2));
    }

    if (format === 'csv') {
      const headers = [
        'id', 'vin', 'dealer_name', 'make', 'model', 'variant', 'year',
        'price_aed', 'original_price_aed', 'mileage_km', 'specification',
        'warranty_available', 'warranty_duration_months', 'warranty_provider',
        'service_history_type', 'accident_status', 'dealer_location', 'completeness_pct'
      ];

      const csvRows = [headers.join(',')];
      vehicles.forEach((v: any) => {
        const row = [
          v.id,
          v.vin,
          `"${(v.dealer_name || '').replace(/"/g, '""')}"`,
          v.make,
          v.model,
          `"${(v.variant || '').replace(/"/g, '""')}"`,
          v.year,
          v.price_aed,
          v.original_price_aed,
          v.mileage_km,
          v.specification,
          v.warranty_available,
          v.warranty_duration_months,
          `"${(v.warranty_provider || '').replace(/"/g, '""')}"`,
          `"${(v.service_history_type || '').replace(/"/g, '""')}"`,
          `"${(v.accident_status || '').replace(/"/g, '""')}"`,
          `"${(v.dealer_location || '').replace(/"/g, '""')}"`,
          v.data_completeness_pct
        ];
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="uae_preowned_inventory.csv"');
      return res.send(csvRows.join('\n'));
    }

    res.status(400).json({ error: 'Unsupported format. Use csv or json.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------
// VITE SPA MIDDLEWARE / PRODUCTION STATIC ASSETS
// ---------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UAE Car Aggregator] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
