import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const defaultProps = {
  data: null,
  credentials: null,
  autoExtent: false
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tilejson: null
    };
  }

  updateState({changeFlags}) {
    const {data} = this.props;
    if (changeFlags.dataChanged && data) {
      this._updateTileJSON();
    }
  }

  async _updateTileJSON() {
    throw new Error(`You must use one of the specific carto layers: BQ or SQL type`);
  }

  onHover(info, pickingEvent) {
    const [mvtLayer] = this.getSubLayers();
    return mvtLayer ? mvtLayer.onHover(info, pickingEvent) : super.onHover(info, pickingEvent);
  }

  renderLayers() {
    if (!this.state.tilejson) return [];

    const props = {
      ...this.getSubLayerProps(this.props),
      uniqueIdProperty: this.props.uniqueIdProperty,
      data: this.state.tilejson.tiles,
      extent: this.props.autoExtent && !this.props.extent
        ? this.state.tilejson.bounds
          ? this.state.tilejson.bounds
          : [-180, -90, 180, 90]
        : null
    };

    return new MVTLayer(props);
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
