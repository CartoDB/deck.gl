import {CompositeLayer} from '@deck.gl/core';
import CartoClassicLayer from './carto-classic-layer';
import CartoSQLLayer from './carto-sql-layer';
import CartoBQTilerLayer from './carto-bqtiler-layer';
import CartoCloudNativeLayer from './carto-cloud-native-layer';
import {getConfig, isModeAllowed, MODE_TYPES} from '../config';
import {FORMATS, MAP_TYPES} from '../api/constants';
import {log} from '@deck.gl/core';

const defaultProps = {
  ...CartoClassicLayer.defaultProps,
  ...CartoCloudNativeLayer.defaultProps,
  format: null,
  mode: null,
  type: null
};

export default class CartoLayer extends CompositeLayer {
  _getLayerClassByModeAndType({format, mode, type}) {}

  renderLayers() {
    const {format, mode, type} = this.props;

    const SubLayerClass = getLayerClassByModeAndType({format, mode, type});

    if (SubLayerClass) {
      return new SubLayerClass(
        Object.assign(
          {_showDeprecationWarning: false},
          this.props,
          this.getSubLayerProps({id: 'carto'})
        )
      );
    }

    return null;
  }
}

function getLayerClassByModeAndType({format, mode, type}) {
  if (!isModeAllowed({mode})) {
    log.assert('CARTO error: parameter "mode" is required');
  }

  const config = getConfig();

  if (config.mode !== mode) {
    log.assert(
      `CARTO error: setConfig "mode" parameter needs to be equal to CartoLayer "mode" property, use one of: ${Object.values(
        MODE_TYPES
      ).toString()}`
    );
  }

  if (!type) {
    log.assert('CARTO error: parameter "type" is required');
  }

  if (mode === MODE_TYPES.CARTO) {
    switch (type) {
      case MAP_TYPES.SQL:
      case MAP_TYPES.TABLE:
        return CartoSQLLayer;
      case MAP_TYPES.TILESET:
        return CartoBQTilerLayer;
      default:
        log.assert(
          `CARTO error: parameter "type" not recognized, use one of: ${Object.values(
            MAP_TYPES
          ).toString()}`
        );
    }
  }

  if (mode === MODE_TYPES.CARTO_CLOUD_NATIVE) {
    const formatValues = Object.values(FORMATS);

    if (!formatValues.includes(format)) {
      log.assert(
        `CARTO error: parameter "format" not recognized, use one of: ${formatValues.toString()}`
      );
    }

    return CartoCloudNativeLayer;
  }

  log.assert(
    `CARTO error: parameter "mode" not recognized, use on of: ${Object.values(
      MODE_TYPES
    ).toString()}`
  );

  return null;
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
