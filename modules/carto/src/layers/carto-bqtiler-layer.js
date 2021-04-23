import CartoClassicLayer from './carto-classic-layer';
import {getTileJSON} from '../api/maps-api-carto-client';
import {CONNECTIONS, MAP_TYPES} from '../api/constants';

export default class CartoBQTilerLayer extends CartoClassicLayer {
  async updateTileJSON() {
    const {credentials, data} = this.props;

    return await getTileJSON({
      connection: CONNECTIONS.BIGQUERY,
      type: MAP_TYPES.TILESET,
      source: data,
      credentials
    });
  }
}

CartoBQTilerLayer.layerName = 'CartoBQTilerLayer';
