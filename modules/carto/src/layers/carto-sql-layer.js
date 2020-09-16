import CartoLayer from './carto-layer';
import {getMapTileJSON} from '../api/maps-api-client';

const mapsApiProps = {
  version: '1.3.1', // MapConfig Version (Maps API)
  bufferSize: 1, // MVT buffersize in pixels,
  extent: 4096 // Tile extent in tile coordinate space (MVT spec.)
};

const defaultProps = {
  ...mapsApiProps,
  ...CartoLayer.defaultProps,
  uniqueIdProperty: 'cartodb_id'
};

export default class CartoSQLLayer extends CartoLayer {
  async _updateTileJSON() {
    const tilejson = await getMapTileJSON(this.props);
    this.setState({tilejson});
  }
}

CartoSQLLayer.layerName = 'CartoSQLLayer';
CartoSQLLayer.defaultProps = defaultProps;
