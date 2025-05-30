import { useEffect, useRef } from "react";
import mapImageSrc from "../assets/world.topo.200412.3x5400x2700.jpg";
import { mapCoord } from "../lib/projection";
import type { Rotation } from "../lib/rotation";

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

	// If it's resolution does not match change it
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}
	return { width, height };
}

function render(canvas: HTMLCanvasElement, rotation: Rotation) {
	const { width, height } = resizeCanvasToDisplaySize(canvas);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		console.error('failed to get 2d context');
		return;
	}
	const output = new ImageData(width, height);
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			const inputCoord = mapCoord(x / width, 1 - y / height, rotation);
			let ix = Math.floor((inputCoord.longitude / Math.TAU) * imageData.width);
			let iy = Math.floor((inputCoord.latitude / Math.PI - 0.5) * imageData.height);
			if (iy < 0) {
				iy = -iy;
				ix += imageData.width * 0.5;
			}
			if (iy >= imageData.height) {
				iy = iy % (2 * imageData.height);
				if (iy >= imageData.height) {
					iy = 2 * imageData.height - iy;
				}
				ix += imageData.width * 0.5;
			}
			if (ix < 0) ix += imageData.width;
			if (ix >= imageData.width) ix -= imageData.width;
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
};

export default function Map({ rotation }: Props) {
	const map = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!map.current) {
			return;
		}
		render(map.current, rotation);
	}, [rotation]);
	return <canvas className="canvas" ref={map}></canvas>;
}
