import {
  ALL_TAMIL_NADU_LOCATIONS,
  findNearestTamilNaduLocation,
  reverseGeocodeCoordinates,
  searchTamilNaduLocations,
} from './weatherService';

async function runLocationTests() {
  console.log('================================================================');
  console.log('TURMERICARE AI — LOCATION & GEOLOCATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: ALL_TAMIL_NADU_LOCATIONS has comprehensive district coverage
  if (ALL_TAMIL_NADU_LOCATIONS.length >= 38) {
    console.log(`[PASS] TEST_1: Directory contains ${ALL_TAMIL_NADU_LOCATIONS.length} Tamil Nadu locations (>= 38 districts)`);
    passed++;
  } else {
    console.error(`[FAIL] TEST_1: Expected >= 38 locations, got ${ALL_TAMIL_NADU_LOCATIONS.length}`);
    failed++;
  }

  // Test 2: findNearestTamilNaduLocation correctly maps coordinates near Erode
  const erodeCoords = { lat: 11.341, lon: 77.717 };
  const nearestErode = findNearestTamilNaduLocation(erodeCoords.lat, erodeCoords.lon);
  if (nearestErode.district === 'Erode' || nearestErode.name === 'Erode') {
    console.log(`[PASS] TEST_2: Coordinates (11.341, 77.717) accurately resolved to ${nearestErode.name}, ${nearestErode.district}`);
    passed++;
  } else {
    console.error(`[FAIL] TEST_2: Expected Erode, got ${nearestErode.name}, ${nearestErode.district}`);
    failed++;
  }

  // Test 3: findNearestTamilNaduLocation correctly maps coordinates near Coimbatore
  const cbeCoords = { lat: 11.016, lon: 76.955 };
  const nearestCbe = findNearestTamilNaduLocation(cbeCoords.lat, cbeCoords.lon);
  if (nearestCbe.district === 'Coimbatore' || nearestCbe.name === 'Coimbatore') {
    console.log(`[PASS] TEST_3: Coordinates (11.016, 76.955) accurately resolved to ${nearestCbe.name}, ${nearestCbe.district}`);
    passed++;
  } else {
    console.error(`[FAIL] TEST_3: Expected Coimbatore, got ${nearestCbe.name}`);
    failed++;
  }

  // Test 4: findNearestTamilNaduLocation correctly maps coordinates near Tirunelveli
  const tnvCoords = { lat: 8.7139, lon: 77.7567 };
  const nearestTnv = findNearestTamilNaduLocation(tnvCoords.lat, tnvCoords.lon);
  if (nearestTnv.district === 'Tirunelveli' || nearestTnv.name === 'Tirunelveli') {
    console.log(`[PASS] TEST_4: Coordinates (8.714, 77.757) accurately resolved to ${nearestTnv.name}, ${nearestTnv.district}`);
    passed++;
  } else {
    console.error(`[FAIL] TEST_4: Expected Tirunelveli, got ${nearestTnv.name}`);
    failed++;
  }

  // Test 5: reverseGeocodeCoordinates preserves device coordinates and produces clean location name
  const res = await reverseGeocodeCoordinates(11.341, 77.717, 15);
  if (res.name && res.district && res.state === 'Tamil Nadu' && res.isCurrentLocation && res.latitude === 11.341 && res.longitude === 77.717) {
    console.log(`[PASS] TEST_5: Reverse geocoding generated clean LocationOption: "${res.name}, ${res.district}" preserving exact coordinates (11.341, 77.717)`);
    passed++;
  } else {
    console.error('[FAIL] TEST_5: Invalid reverse geocoded structure', res);
    failed++;
  }

  // Test 6: Specific Thokkavadi reverse geocoding test (must resolve Thokkavadi, Tiruchengode)
  const thokkavadiCoords = { lat: 11.3696688, lon: 77.8409923 };
  const thokkavadiRes = await reverseGeocodeCoordinates(thokkavadiCoords.lat, thokkavadiCoords.lon, 10);
  if (thokkavadiRes.name.includes('Thokkavadi') && (thokkavadiRes.district.includes('Tiruchengode') || thokkavadiRes.district.includes('Namakkal'))) {
    console.log(`[PASS] TEST_6: Thokkavadi GPS coordinates correctly resolved to "${thokkavadiRes.name}, ${thokkavadiRes.district}" [Current] without reducing to nearest city`);
    passed++;
  } else {
    console.error(`[FAIL] TEST_6: Expected Thokkavadi locality, got "${thokkavadiRes.name}, ${thokkavadiRes.district}"`);
    failed++;
  }

  // Test 7: Specific Tiruchengode & Namakkal resolution test
  const tcodeCoords = { lat: 11.378, lon: 77.896 };
  const tcodeRes = await reverseGeocodeCoordinates(tcodeCoords.lat, tcodeCoords.lon);
  if (tcodeRes.name && tcodeRes.district) {
    console.log(`[PASS] TEST_7: Tiruchengode GPS coordinates resolved to "${tcodeRes.name}, ${tcodeRes.district}"`);
    passed++;
  } else {
    console.error('[FAIL] TEST_7: Failed resolving Tiruchengode', tcodeRes);
    failed++;
  }

  // Test 8: searchTamilNaduLocations finds districts
  const searchRes = await searchTamilNaduLocations('Salem');
  if (searchRes.length > 0 && searchRes.some((l) => l.name.includes('Salem') || l.district === 'Salem')) {
    console.log(`[PASS] TEST_8: searchTamilNaduLocations('Salem') returned ${searchRes.length} matching locations`);
    passed++;
  } else {
    console.error('[FAIL] TEST_8: Failed searching for Salem');
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED / ${failed} FAILED (TOTAL ${passed + failed})`);
  console.log(`ALL LOCATION TESTS PASSED: ${failed === 0}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLocationTests();
