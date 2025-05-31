import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import mapImageSrc from "../assets/world.topo.200412.3x5400x2700.jpg";
import { aspectRatio, mapCoord } from "../lib/projection";
import type { Rotation } from "../lib/rotation";
import type { Projection } from "./ProjectionSelector";

const downscaleFactor = 3;

const imageData = await (async () => {
	const imageBlob = await (await fetch(mapImageSrc)).blob();
	const imageBitmap = await createImageBitmap(imageBlob);
	const w = Math.round(imageBitmap.width / downscaleFactor);
	const h = Math.round(imageBitmap.height / downscaleFactor);
	const c = new OffscreenCanvas(w, h);
	const ctx = c.getContext('2d');
	if (!ctx) {
		throw new Error('failed to get offscreen 2d context');
	}
	ctx.drawImage(imageBitmap, 0, 0, c.width, c.height);
	return ctx.getImageData(0, 0, c.width, c.height);
})();

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
	// look up the size the canvas is being displayed
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	// if its resolution does not match, change it
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
	return { width, height };
}

function render(canvas: HTMLCanvasElement, rotation: Rotation, projection: Projection) {
	const { width, height } = resizeCanvasToDisplaySize(canvas);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('failed to get 2d context');
		return;
	}
	const output = new ImageData(width, height);
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			const { latitude, longitude } = mapCoord(x / width, 1 - y / height, rotation, projection);
			if (latitude < -Math.PI / 2 || latitude > Math.PI / 2) {
				throw new Error(`invalid latitude ${latitude.toFixed(3)}`);
			}
			if (longitude < -Math.PI || latitude > Math.PI) {
				throw new Error(`invalid latitude ${latitude.toFixed(3)}`);
			}
			const ix = Math.floor((longitude + Math.PI) / Math.TAU * imageData.width);
			const iy = Math.floor((0.5 - latitude / Math.PI) * imageData.height);
			output.data[(y * width + x) * 4] = imageData.data[(iy * imageData.width + ix) * 4];
			output.data[(y * width + x) * 4 + 1] = imageData.data[(iy * imageData.width + ix) * 4 + 1];
			output.data[(y * width + x) * 4 + 2] = imageData.data[(iy * imageData.width + ix) * 4 + 2];
			output.data[(y * width + x) * 4 + 3] = 255;
		}
	}
	ctx.putImageData(output, 0, 0);
}

type Props = {
	rotation: Rotation;
	projection: Projection;
};

function getWindowSize() {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	};
}

function useWindowSize() {
	const [windowSize, setWindowSize] = useState(getWindowSize());

	useEffect(() => {
		function handleResize() {
			setWindowSize(getWindowSize());
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		}
	}, []);

	return windowSize;
}

export default function Map({ rotation, projection }: Props) {
	const map = useRef<HTMLCanvasElement>(null);
	const windowSize = useWindowSize();
	useEffect(() => {
		if (!map.current) {
			return;
		}
		render(map.current, rotation, projection);
	}, [rotation, windowSize, projection]);
	const ratio = useMemo(() => aspectRatio(projection), [projection]);
	const style = useMemo((): CSSProperties => ({
		width: `calc(min(90vw, ${ratio.toString()} * 90vh))`,
		height: `calc(min(90vh, ${(1 / ratio).toString()} * 90vw))`,
	}), [ratio]);
	return <canvas style={style} ref={map}></canvas>;
}
