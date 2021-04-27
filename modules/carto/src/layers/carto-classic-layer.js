import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const defaultProps = {
  ...MVTLayer.defaultProps,
  data: null,
  credentials: null,
  onDataLoad: {type: 'function', value: tilejson => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true},
  _showDeprecationWarning: true
};

export default class CartoClassicLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tilejson: null
    };

    if (this.props._showDeprecationWarning) {
      // eslint-disable-next-line
      console.warn(
        'CARTO warning: CartoSQLLayer and CartoBQTilerLayer will be removed in the following deck.gl versions, and they are not recommended to use. Use CartoLayer instead.'
      );
    }
  }

  get isLoaded() {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const tilejson = await this.updateTileJSON();
      this.setState({tilejson});
      this.props.onDataLoad(tilejson);
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err);
      } else {
        throw err;
      }
    }
  }

  async updateTileJSON() {
    throw new Error('You must use one of the specific carto layers: BQ or SQL type');
  }

  renderLayers() {
    if (!this.state.tilejson) return null;

    const {updateTriggers} = this.props;

    return new MVTLayer(
      this.props,
      this.getSubLayerProps({
        id: 'classic',
        data: this.state.tilejson,
        updateTriggers
      })
    );
  }
}

CartoClassicLayer.layerName = 'CartoClassicLayer';
CartoClassicLayer.defaultProps = defaultProps;