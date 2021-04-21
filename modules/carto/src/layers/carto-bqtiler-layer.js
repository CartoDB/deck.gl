import CartoClassicLayer from './carto-classic-layer';
import {getTileJSON} from '../api/maps-api-carto-client';
import {CONNECTIONS, MAP_TYPES} from '../api/constants';

export default class CartoBQTilerLayer extends CartoClassicLayer {
  constructor(...args) {
    super(...args);
    this._displayDeprecationWarning();
  }

  _displayDeprecationWarning() {
    if (this.props._showDeprecationWarning) {
      console.warn('CARTO warning: CartoBQTilerLayer will be removed in the following deck.gl versions, and it is not recommended to use. Use CartoLayer instead.');
    }
  }

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
