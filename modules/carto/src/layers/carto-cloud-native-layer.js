import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMap} from '../api/maps-api-carto-cloud-native-client';

const defaultProps = {
  ...MVTLayer.defaultProps,
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // carto credentials, set to null to read from default
  credentials: null,
  // (String {bigquery, snowflake,redshift, postgres}, required)
  provider: null,
  // (String, required): connection name at CARTO platform
  connection: null,
  // (String {table, sql, tileset}, required)
  type: null,
  // renderSubLayers used to render. Any deck.gl layer or null to autodetect
  renderSubLayers: null,
  // (String {geojson, json, tileset}, optional). Desired data format. By default, it's guessed automaticaly
  format: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true}
};

export default class CartoCloudNativeLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      data: null,
      SubLayer: null
    };
  }

  get isLoaded() {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  updateState({props, oldProps, changeFlags}) {
    const shouldUpdateData = changeFlags.dataChanged ||
        props.provider !== oldProps.provider ||
        props.connection !== oldProps.connection ||
        props.type !== oldProps.type ||
        JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials);

    if (shouldUpdateData) {
      this.setState({data: null, SubLayer: null});
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const {provider, type, data: source, connection, credentials, format} = this.props;
      const [data, mapFormat] = await getMap({provider, type, source, connection, credentials, format});
      const SubLayer = this.state.SubLayer || this.props.renderSubLayers || getSublayerFromMapFormat(mapFormat);

      this.setState({SubLayer, data});
      this.props.onDataLoad(data);
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err);
      } else {
        throw err;
      }
    }
  }

  renderLayers() {
    const {data, SubLayer} = this.state;
    if (!data) return null;

    const {renderSubLayers, updateTriggers} = this.props;
    const props = {...this.props};
    delete props.data;

    if (renderSubLayers) {
      return SubLayer({ ...props, data })
    }

    return new SubLayer(
      props,
      this.getSubLayerProps({
        id: 'cloud-native',
        data,
        updateTriggers
      })
    );
  }
}

function getSublayerFromMapFormat(format) {
  switch(format) {
    case 'tilejson':
      return MVTLayer;
    case 'geojson':
      return GeoJsonLayer;
    default:
      return null;
  }
}

CartoCloudNativeLayer.layerName = 'CartoCloudNativeLayer';
CartoCloudNativeLayer.defaultProps = defaultProps;
