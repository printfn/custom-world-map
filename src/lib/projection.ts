import type { Rotation } from "./rotation";

// const R = 6371;

export function latLongToVector3(lat: number, lon: number): [number, number, number] {
	const x = Math.cos(lat) * Math.cos(lon);
	const y = Math.cos(lat) * Math.sin(lon);
	const z = Math.sin(lat);
	return [x, y, z];
}

export function unitVectorToLatLon(v: [number, number, number]) {
	const lat = Math.asin(v[2]);
	const lon = Math.atan2(v[1], v[0]);
	return { lat, lon };
}

export function mapCoord(x: number, y: number, rotation: Rotation) {
	const rawLong = (x - 0.5) * Math.TAU;
	const rawLat = (y - 0.5) * Math.PI;
	const vector = latLongToVector3(rawLat, rawLong);
	const outputVector = rotation.quaternion.rotateVector(vector);
	const outputCoord = unitVectorToLatLon(outputVector);
	return {
		longitude: outputCoord.lon,
		latitude: outputCoord.lat,
	};
}
