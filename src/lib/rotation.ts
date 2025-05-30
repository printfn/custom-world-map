import Q, { Quaternion } from "quaternion";

export class Rotation {
	#quat: Quaternion;

	constructor();
	constructor(latitude: number, longitude: number, heading: number);
	constructor(latitude?: number, longitude?: number, heading?: number) {
		if (latitude !== undefined && (latitude < -Math.TAU / 4 || latitude > Math.TAU / 4)) {
			throw new Error(`latitude out of range: ${latitude.toFixed(3)}`);
		}
		this.#quat = Q.fromEuler(longitude ?? 0, -(latitude ?? 0), heading ?? 0, 'ZYX');
	}

	static fromDegrees(latitude: number, longitude: number, heading: number) {
		if (latitude < -90 || latitude > 90) {
			throw new Error(`latitude out of range: ${latitude.toFixed(3)}`);
		}
		return new Rotation(latitude * Math.PI / 180, longitude * Math.PI / 180, heading * Math.PI / 180);
	}

	get latitudeRadians() {
		return -this.#quat.toEuler('ZYX')[1];
	}
	get latitudeDegrees() {
		return this.latitudeRadians * 180 / Math.PI;
	}
	get longitudeRadians() {
		return this.#quat.toEuler('ZYX')[0];
	}
	get longitudeDegrees() {
		return this.longitudeRadians * 180 / Math.PI
	}
	get headingRadians() {
		return this.#quat.toEuler('ZYX')[2];
	}
	get headingDegrees() {
		return this.headingRadians * 180 / Math.PI;
	}
	
	get quaternion() {
		return this.#quat;
	}

	debug() {
		return Object.entries({
			lat: this.latitudeDegrees,
			lon: this.longitudeDegrees,
			hea: this.headingDegrees,
			w: this.#quat.w,
			x: this.#quat.x,
			y: this.#quat.y,
			z: this.#quat.z,
		}).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join(' ');
	}

	withLongitudeRadians(longitude: number) {
		return new Rotation(this.latitudeRadians, longitude, this.headingRadians);
	}
	withLongitudeDegrees(longitude: number) {
		return this.withLongitudeRadians(longitude * Math.PI / 180);
	}

	withLatitudeRadians(latitude: number) {
		return new Rotation(latitude, this.longitudeRadians, this.headingRadians);
	}
	withLatitudeDegrees(latitude: number) {
		return this.withLatitudeRadians(latitude * Math.PI / 180);
	}

	withHeadingRadians(heading: number) {
		return new Rotation(this.latitudeRadians, this.longitudeRadians, heading);
	}
	withHeadingDegrees(heading: number) {
		return this.withHeadingRadians(heading * Math.PI / 180);
	}
}
