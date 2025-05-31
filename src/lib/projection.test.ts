import { equirectangular, orthographic, latLongToVector3, mapCoord, unitVectorToLatLon } from "./projection"
import { Rotation } from "./rotation"

const EPSILON = 1e-10;

function closeEnough(actual: number, expected: number): boolean {
	if (Math.abs(actual - expected) < EPSILON) {
		return true;
	}
	throw new Error(`${actual.toFixed(5)} != ${expected.toFixed(5)}`);
}

describe('latLongToVector3 + unitVectorToLatLon round trip', () => {
	it('should return original lat/lon for equator (0, 0)', () => {
		const lat = 0;
		const lon = 0;
		const vec = latLongToVector3(lat, lon);
		const { lat: lat2, lon: lon2 } = unitVectorToLatLon(vec);
		expect(closeEnough(lat2, lat)).toBe(true);
		expect(closeEnough(lon2, lon)).toBe(true);
	});

	it('should return original lat/lon for north pole (π/2, anything)', () => {
		const lat = Math.PI / 2;
		const lon = 1.234; // longitude is undefined at poles but should remain consistent
		const vec = latLongToVector3(lat, lon);
		const { lat: lat2 } = unitVectorToLatLon(vec);
		expect(closeEnough(lat2, lat)).toBe(true);
	});

	it('should return original lat/lon for south pole (-π/2, anything)', () => {
		const lat = -Math.PI / 2;
		const lon = 3.1415;
		const vec = latLongToVector3(lat, lon);
		const { lat: lat2 } = unitVectorToLatLon(vec);
		expect(closeEnough(lat2, lat)).toBe(true);
	});

	it('should return original lat/lon for 45°N, 45°E', () => {
		const lat = Math.PI / 4;
		const lon = Math.PI / 4;
		const vec = latLongToVector3(lat, lon);
		const { lat: lat2, lon: lon2 } = unitVectorToLatLon(vec);
		expect(closeEnough(lat2, lat)).toBe(true);
		expect(closeEnough(lon2, lon)).toBe(true);
	});

	it('should return original lat/lon for random values', () => {
		const lat = -Math.PI / 6;
		const lon = Math.TAU * 0.75 - Math.PI; // keeping lon in [-π, π]
		const vec = latLongToVector3(lat, lon);
		const { lat: lat2, lon: lon2 } = unitVectorToLatLon(vec);
		expect(closeEnough(lat2, lat)).toBe(true);
		expect(closeEnough(lon2, lon)).toBe(true);
	});
});

describe('rotation', () => {
	it('should show antarctica at the bottom if there is no rotation', () => {
		expect(equirectangular(0.5, 0)).toEqual({ longitude: 0, latitude: -Math.PI / 2 });
	});
	it('basic rotations', () => {
		const eq = { type: 'equirectangular' } as const;
		const actual = mapCoord(0.5, 0.5, Rotation.fromDegrees(-45, 0, 0), eq);
		if (!actual) {
			throw new Error('mapCoord must not return undefined');
		}
		expect(closeEnough(actual.longitude, 0)).toBeTruthy();
		expect(closeEnough(actual.latitude, -Math.PI / 4)).toBeTruthy();

		expect(mapCoord(0.5, 0.25, Rotation.fromDegrees(-45, 0, 0), eq)).toEqual({ longitude: 0, latitude: -Math.PI / 2 });
	});
});

describe('orthographic', () => {
	it('should put the origin in the center', () => {
		expect(orthographic(0.5, 0.5)).toEqual({ latitude: 0, longitude: 0 });
	});
	it('should put the the north pole on top', () => {
		expect(orthographic(0.5, 1)).toEqual({ latitude: Math.PI / 2, longitude: 0 });
	});
});
