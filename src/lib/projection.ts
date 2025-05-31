import type { Projection } from "../components/ProjectionSelector";
import type { Rotation } from "./rotation";

type LatLong = {
	latitude: number;
	longitude: number;
}

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

export function equirectangular(x: number, y: number) {
	return {
		latitude: (y - 0.5) * Math.PI,
		longitude: (x - 0.5) * Math.TAU,
	};
}

export function mercator(x: number, y: number) {
	return {
		latitude: 2 * Math.atan(Math.exp((y - 0.5) * Math.TAU)) - Math.PI / 2,
		longitude: (x - 0.5) * Math.TAU,
	};
}

// i.e. a globe
export function orthographic(x: number, y: number) {
	x = (x - 0.5) * 2;
	y = (y - 0.5) * 2;
	const r2 = x ** 2 + y ** 2;
	if (r2 > 1) return;
	const z = Math.sqrt(1 - r2);
	return {
		latitude: Math.asin(y),
		longitude: Math.atan2(x, z),
	}
}

export function aspectRatio(projection: Projection) {
	switch (projection.type) {
		case 'equirectangular':
			return 2;
		case 'orthographic':
		case 'mercator':
			return 1;
	}
}

export function mapCoord(x: number, y: number, rotation: Rotation, projection: Projection) {
	let rawCoord: LatLong | undefined;
	switch (projection.type) {
		case 'equirectangular':
			rawCoord = equirectangular(x, y);
			break;
		case 'orthographic':
			rawCoord = orthographic(x, y);
			break;
		case 'mercator':
			rawCoord = mercator(x, y);
			break;
	}
	if (!rawCoord) {
		return;
	}
	const vector = latLongToVector3(rawCoord.latitude, rawCoord.longitude);
	const outputVector = rotation.quaternion.rotateVector(vector);
	const outputCoord = unitVectorToLatLon(outputVector);
	return {
		longitude: outputCoord.lon,
		latitude: outputCoord.lat,
	};
}
