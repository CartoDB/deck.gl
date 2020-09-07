import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {CartoSQLLayer, setDefaultCredentials} from '@deck.gl/carto';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2
};

setDefaultCredentials({
  username: 'public',
  apiKey: 'default_public'
});

const selectStyles = {
  position: 'absolute',
  zIndex: 1
};

function getContinentCondition(continent) {
  return continent ? `WHERE continent_name='${continent}'` : '';
}

export default function App() {
  const [continent, setContinent] = useState(null);

  const layer = new CartoSQLLayer({
    data: `SELECT * FROM world_population_2015 ${getContinentCondition(continent)}`,
    pointRadiusMinPixels: 6,
    getLineColor: [0, 0, 0, 0.75],
    getFillColor: [238, 77, 90],
    lineWidthMinPixels: 1
  });

  return (
    <div>
      <select style={selectStyles} onChange={e => setContinent(e.currentTarget.value)}>
        <option value="">All</option>
        <option value="Africa">Africa</option>
        <option value="Europe">Europe</option>
      </select>

      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layer]}
      >
        <StaticMap
          reuseMaps
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          preventStyleDiffing
        />
      </DeckGL>
    </div>
  );
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));