import { useId } from "react";
import { Rotation } from "../lib/rotation";

type Props = {
	rotation: Rotation;
	setRotation: (rotation: Rotation) => void;
};

function strictParseNumber(s: string, min: number, max: number): number | undefined {
	const n = parseFloat(s);
	if (isNaN(n) || n < min || n > max) {
		return undefined;
	}
	return n;
}

export default function RotationSelector({ rotation, setRotation }: Props) {
	const id = useId();
	return <>
		<label htmlFor={`${id}-long`}>Longitude: </label>
		<input type="range" value={rotation.longitudeDegrees} min={-180} max={180} onInput={e => {
			const n = strictParseNumber(e.currentTarget.value, -180, 180);
			if (n === undefined) return;
			setRotation(rotation.withLongitudeDegrees(n));
		}} />
		<br />
		<label htmlFor={`${id}-long`}>Latitude: </label>
		<input type="range" value={rotation.latitudeDegrees} min={-95} max={90} onInput={e => {
			const n = strictParseNumber(e.currentTarget.value, -85, 85);
			if (n === undefined) return;
			setRotation(rotation.withLatitudeDegrees(n));
		}} />
		<br />
		<label htmlFor={`${id}-head`}>Heading: </label>
		<input type="range" value={rotation.headingDegrees} min={-180} max={180} onInput={e => {
			const n = strictParseNumber(e.currentTarget.value, -180, 180);
			if (n === undefined) return;
			setRotation(rotation.withHeadingDegrees(n));
		}} />
		<br />
		<code>{rotation.debug()}</code>
	</>;
}
