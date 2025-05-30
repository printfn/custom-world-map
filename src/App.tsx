import { useState } from 'react';
import './App.css';
import Map from './components/Map';
import RotationSelector from './components/RotationSelector';
import { Rotation } from './lib/rotation';

function App() {
	const [rotation, setRotation] = useState(new Rotation());

	return (
		<>
			<h1>World Map</h1>
			<Map rotation={rotation} />
			<RotationSelector rotation={rotation} setRotation={setRotation} />
		</>
	);
}

export default App
