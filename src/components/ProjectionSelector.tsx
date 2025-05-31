import { useCallback, useId, type FormEvent } from "react";

export type Projection = {
	type: 'equirectangular' | 'orthographic';
};

type Props = {
	projection: Projection;
	setProjection: (p: Projection) => void;
}

export default function ProjectionSelector({ projection, setProjection }: Props) {
	const onInput = useCallback((e: FormEvent<HTMLSelectElement>) => {
		setProjection({ type: e.currentTarget.value as Projection['type'] });
	}, [setProjection]);
	const id = useId();

	return <>
		<label htmlFor={`${id}-projection-type`}>Projection: </label>
		<select id={`${id}-projection-type`} value={projection.type} onInput={onInput}>
			<option value="equirectangular">Equirectangular</option>
			<option value="orthographic">Orthographic (Globe)</option>
		</select>
	</>;
}
