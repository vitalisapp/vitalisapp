// Activity Map → MapLibre rendering boundary — pure unit tests (node --test).
// Guards the [lat, lng] (app / DB) → [lng, lat] (GeoJSON / MapLibre) flip,
// GeoJSON validity and the theme-swap style transform.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isValidLatLng,
  toLngLat,
  pathToLngLats,
  pathToLineFeatureCollection,
  boundsOf,
  carryOverVitalisLayers,
  mapStyleUrl,
  MAP_STYLE_URLS,
  VITALIS_PREFIX,
} from "../../src/features/user/ActivityMap/utils/mapAdapter.js";

// Manila: 14.5995° N, 120.9842° E — lat and lng are clearly distinguishable.
const MANILA = [14.5995, 120.9842];

describe("toLngLat", () => {
  it("flips a known [lat, lng] point to [lng, lat]", () => {
    assert.deepEqual(toLngLat(MANILA), [120.9842, 14.5995]);
  });

  it("accepts { lat, lng } / { latitude, longitude } objects", () => {
    assert.deepEqual(toLngLat({ lat: 14.5995, lng: 120.9842 }), [120.9842, 14.5995]);
    assert.deepEqual(toLngLat({ latitude: -33.86, longitude: 151.21 }), [151.21, -33.86]);
  });

  it("accepts numeric strings from stored JSON", () => {
    assert.deepEqual(toLngLat(["14.5995", "120.9842"]), [120.9842, 14.5995]);
  });

  it("rejects null, NaN, missing and out-of-range coordinates", () => {
    for (const bad of [null, undefined, [], [NaN, 1], [1], [91, 0], [0, 181], [-90.1, 0], "x", {}]) {
      assert.equal(toLngLat(bad), null, `expected null for ${JSON.stringify(bad)}`);
      assert.equal(isValidLatLng(bad), false);
    }
  });

  it("accepts the exact range limits", () => {
    assert.deepEqual(toLngLat([90, 180]), [180, 90]);
    assert.deepEqual(toLngLat([-90, -180]), [-180, -90]);
  });

  it("does not mutate its input", () => {
    const p = [14.5995, 120.9842];
    toLngLat(p);
    assert.deepEqual(p, [14.5995, 120.9842]);
  });
});

describe("pathToLineFeatureCollection", () => {
  it("returns an empty FeatureCollection for empty / single-point paths", () => {
    for (const path of [[], [MANILA], undefined, null, "nope"]) {
      const fc = pathToLineFeatureCollection(path);
      assert.equal(fc.type, "FeatureCollection");
      assert.equal(fc.features.length, 0);
    }
  });

  it("builds a valid LineString in [lng, lat] order", () => {
    const path = [MANILA, [14.6, 120.985], [14.601, 120.986]];
    const fc = pathToLineFeatureCollection(path);
    assert.equal(fc.features.length, 1);
    const g = fc.features[0].geometry;
    assert.equal(g.type, "LineString");
    assert.deepEqual(g.coordinates, [[120.9842, 14.5995], [120.985, 14.6], [120.986, 14.601]]);
  });

  it("drops invalid points and never emits a 1-position LineString", () => {
    const fc = pathToLineFeatureCollection([MANILA, [NaN, 1], null, [200, 0]]);
    assert.equal(fc.features.length, 0);
    const fc2 = pathToLineFeatureCollection([MANILA, null, [14.6, 120.985]]);
    assert.equal(fc2.features[0].geometry.coordinates.length, 2);
  });

  it("does not mutate the recorded path", () => {
    const path = [[14.5995, 120.9842], [14.6, 120.985]];
    const copy = JSON.parse(JSON.stringify(path));
    pathToLineFeatureCollection(path);
    pathToLngLats(path);
    assert.deepEqual(path, copy);
  });
});

describe("boundsOf", () => {
  it("returns [[west, south], [east, north]]", () => {
    assert.deepEqual(boundsOf([[14.6, 121], [14.5, 120.9], [14.55, 120.95]]), [[120.9, 14.5], [121, 14.6]]);
  });

  it("handles a single point and empty paths", () => {
    assert.deepEqual(boundsOf([MANILA]), [[120.9842, 14.5995], [120.9842, 14.5995]]);
    assert.equal(boundsOf([]), null);
    assert.equal(boundsOf([[NaN, NaN]]), null);
  });
});

describe("mapStyleUrl", () => {
  it("uses keyless OpenFreeMap styles per theme", () => {
    assert.equal(mapStyleUrl(false), MAP_STYLE_URLS.light);
    assert.equal(mapStyleUrl(true), MAP_STYLE_URLS.dark);
    for (const url of Object.values(MAP_STYLE_URLS)) {
      assert.match(url, /^https:\/\/tiles\.openfreemap\.org\/styles\/[a-z]+$/);
    }
  });
});

describe("carryOverVitalisLayers", () => {
  const routeSrc = { type: "geojson", data: { type: "FeatureCollection", features: [] } };
  const previous = {
    version: 8,
    sources: { openmaptiles: { type: "vector" }, [`${VITALIS_PREFIX}live-route`]: routeSrc },
    layers: [
      { id: "background", type: "background" },
      { id: `${VITALIS_PREFIX}live-route-core`, type: "line", source: `${VITALIS_PREFIX}live-route` },
    ],
  };
  const next = {
    version: 8,
    center: [0, 0], zoom: 1, bearing: 10, pitch: 20,
    sources: { openmaptiles: { type: "vector", url: "dark" } },
    layers: [{ id: "background-dark", type: "background" }],
  };

  it("keeps the new base style and appends Vitalis sources + layers on top", () => {
    const out = carryOverVitalisLayers(previous, next);
    assert.equal(out.sources.openmaptiles.url, "dark");
    assert.equal(out.sources[`${VITALIS_PREFIX}live-route`], routeSrc);
    assert.deepEqual(out.layers.map((l) => l.id), ["background-dark", `${VITALIS_PREFIX}live-route-core`]);
  });

  it("drops the incoming style's camera so a theme toggle never moves the map", () => {
    const out = carryOverVitalisLayers(previous, next);
    for (const k of ["center", "zoom", "bearing", "pitch"]) assert.equal(k in out, false);
  });

  it("works without a previous style and does not duplicate layers", () => {
    assert.deepEqual(carryOverVitalisLayers(undefined, next).layers, next.layers);
    const twice = carryOverVitalisLayers(previous, carryOverVitalisLayers(previous, next));
    assert.equal(twice.layers.filter((l) => l.id.startsWith(VITALIS_PREFIX)).length, 1);
  });
});

describe("accuracyCircleFeatureCollection", () => {
  it("returns empty for missing position or accuracy", async () => {
    const { accuracyCircleFeatureCollection } = await import("../../src/features/user/ActivityMap/utils/mapAdapter.js");
    for (const [c, r] of [[null, 10], [MANILA, null], [MANILA, 0], [MANILA, NaN], [[NaN, 0], 10]]) {
      assert.equal(accuracyCircleFeatureCollection(c, r).features.length, 0);
    }
  });

  it("builds a closed polygon whose radius matches the accuracy in metres", async () => {
    const { accuracyCircleFeatureCollection } = await import("../../src/features/user/ActivityMap/utils/mapAdapter.js");
    const { haversineMeters } = await import("../../src/features/user/ActivityMap/utils/geo.js");
    const ring = accuracyCircleFeatureCollection(MANILA, 50).features[0].geometry.coordinates[0];
    assert.deepEqual(ring[0], ring[ring.length - 1]);
    for (const [lng, lat] of ring) {
      const d = haversineMeters(MANILA, [lat, lng]);
      assert.ok(Math.abs(d - 50) < 0.5, `radius ${d.toFixed(2)}m should be ~50m`);
    }
  });

  it("caps very coarse fixes at ACCURACY_MAX_RADIUS_M", async () => {
    const { accuracyCircleFeatureCollection, ACCURACY_MAX_RADIUS_M } = await import("../../src/features/user/ActivityMap/utils/mapAdapter.js");
    const { haversineMeters } = await import("../../src/features/user/ActivityMap/utils/geo.js");
    const [lng, lat] = accuracyCircleFeatureCollection(MANILA, 1e6).features[0].geometry.coordinates[0][0];
    assert.ok(Math.abs(haversineMeters(MANILA, [lat, lng]) - ACCURACY_MAX_RADIUS_M) < 50);
  });
});
