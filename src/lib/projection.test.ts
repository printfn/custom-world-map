import { latLongToVector3, mapCoord, unitVectorToLatLon } from "./projection"
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
		expect(mapCoord(0.5, 0, Rotation.fromDegrees(0, 0, 0))).toEqual({ longitude: 0, latitude: -Math.PI / 2 });
	})
	it('basic rotations', () => {
		expect(mapCoord(0.5, 0.5, Rotation.fromDegrees(-45, 0, 0))).toEqual({ longitude: 0, latitude: -Math.PI / 4 });
		const actual = mapCoord(0.5, 0.5, Rotation.fromDegrees(-45, 0, 0));
		expect(closeEnough(actual.longitude, 0)).toBeTruthy();
		expect(closeEnough(actual.latitude, -Math.PI / 4)).toBeTruthy();

		expect(mapCoord(0.5, 0.25, Rotation.fromDegrees(-45, 0, 0))).toEqual({ longitude: 0, latitude: -Math.PI / 2 });
	})
})
