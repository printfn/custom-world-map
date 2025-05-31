import { useState } from 'react';
import './App.css';
import Map from './components/Map';
import RotationSelector from './components/RotationSelector';
import { Rotation } from './lib/rotation';
import type { Projection } from './components/ProjectionSelector';
import ProjectionSelector from './components/ProjectionSelector';

function App() {
	const [rotation, setRotation] = useState(new Rotation());
	const [projection, setProjection] = useState<Projection>({ type: 'equirectangular' });

	return (
		<>
			<h1>World Map</h1>
			<Map rotation={rotation} projection={projection} />
			<br />
			<ProjectionSelector projection={projection} setProjection={setProjection} />
			<br />
			<RotationSelector rotation={rotation} setRotation={setRotation} />
		</>
	);
}

export default App
