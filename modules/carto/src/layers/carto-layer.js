import {CompositeLayer} from '@deck.gl/core';
import CartoClassicLayer from './carto-classic-layer';
import CartoSQLLayer from './carto-sql-layer'
import CartoBQTilerLayer from './carto-bqtiler-layer';
import CartoCloudNativeLayer from './carto-cloud-native-layer';
import {getConfig, isModeAllowed, MODE_TYPES} from '../config';
import {MAP_TYPES} from '../api/types';

const defaultProps = {
  ...CartoClassicLayer.defaultProps,
  ...CartoCloudNativeLayer.defaultProps
};

export default class CartoLayer extends CompositeLayer {
  renderLayers() {
    const { mode, type } = this.props;

    const TargetLayerClass = getLayerByModeAndType({ mode, type });
    const SubLayerClass = this.getSubLayerClass('carto-layer', TargetLayerClass);

    const layer = new SubLayerClass(
      {...this.props},
      this.getSubLayerProps({
        id: `carto-${SubLayerClass.layerName}`
      }),{
        _showDeprecationWarning: false
      }
    );

    return layer;
  }
}

function getLayerByModeAndType({ mode, type }) {
  if (!isModeAllowed({ mode })) {
    throw new Error('CARTO error: parameter mode is required'); 
  }

  const config = getConfig();

  if (config.mode !== mode) {
    throw new Error(`CARTO error: setConfig "mode" parameter needs to be equal to CartoLayer "mode" property, use one of: ${Object.values(MODE_TYPES).toString()}`);  
  }

  if (!type) {
    throw new Error('CARTO error: parameter type is required');  
  }

  if (mode === MODE_TYPES.CARTO) {
    switch (type) {
      case MAP_TYPES.SQL:
      case MAP_TYPES.TABLE:
        return CartoSQLLayer;
      case MAP_TYPES.TILESET:
        return CartoBQTilerLayer;
      default:
        throw new Error(`CARTO error: parameter type not recognized, use one of: ${Object.values(MAP_TYPES).toString()}`);
    }
  }

  if (mode === MODE_TYPES.CARTO_CLOUD_NATIVE) {
    return CartoCloudNativeLayer;
  }

  throw new Error(`CARTO error: parameter mode not recognized, use on of: ${Object.values(MODE_TYPES).toString()}`);;
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
