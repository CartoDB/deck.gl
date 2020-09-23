import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {JSONLoader} from '@loaders.gl/json';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';

const WORLD_SIZE = 512;

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null,
  tileJSON: null,
  onTileJSONLoad: {type: 'function', optional: true, value: null, compare: false}
};

export default class MVTLayer extends TileLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      data: null,
      tileJSON: null,
      fetchingTileJSON: false
    });
  }

  get isLoaded() {
    const {fetchingTileJSON} = this.state;
    return !fetchingTileJSON && super.isLoaded;
  }

  updateState({props, oldProps, context, changeFlags}) {
    changeFlags.dataChanged = changeFlags.dataChanged || props.tileJSON !== oldProps.tileJSON;

    if (changeFlags.dataChanged) {
      // Save the fetchingTileJSON state - should not trigger a rerender
      this.state.fetchingTileJSON = changeFlags.dataChanged;
    }

    super.updateState({props, oldProps, context, changeFlags});

    if (changeFlags.dataChanged) {
      this._updateTileData({props});
    }
  }

  async _updateTileData({props}) {
    const {onTileJSONLoad} = this.props;
    const {tileset} = this.state;
    let {data, tileJSON, minZoom, maxZoom} = props;

    if (tileJSON) {
      if (typeof tileJSON === 'string') {
        this.setState({fetchingTileJSON: true});
        try {
          tileJSON = await load(tileJSON, JSONLoader);
        } catch (error) {
          this.setState({fetchingTileJSON: false});
          throw new Error(`An error occurred fetching Tilejson: ${error}`);
        }

        if (onTileJSONLoad) {
          onTileJSONLoad(tileJSON);
        }
      }

      data = tileJSON.tiles;
      minZoom = tileJSON.minzoom || minZoom;
      maxZoom = tileJSON.maxzoom || maxZoom;
    }

    tileset.setOptions({minZoom, maxZoom});
    this.setState({data, tileJSON, fetchingTileJSON: false});
  }

  _updateTileset() {
    if (!this.state.fetchingTileJSON) {
      super._updateTileset();
    }
  }

  getTileData(tile) {
    const url = getURLFromTemplate(this.state.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    let options = this.getLoadOptions();
    options = {
      ...options,
      mvt: {
        ...(options && options.mvt),
        coordinates: this.context.viewport.resolution ? 'wgs84' : 'local',
        tileIndex: {x: tile.x, y: tile.y, z: tile.z}
      }
    };
    return load(url, MVTLoader, options);
  }

  renderSubLayers(props) {
    const {tile} = props;
    const worldScale = Math.pow(2, tile.z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    const modelMatrix = new Matrix4().scale([xScale, yScale, 1]);

    props.autoHighlight = false;
    if (!this.context.viewport.resolution) {
      props.modelMatrix = modelMatrix;
      props.coordinateOrigin = [xOffset, yOffset, 0];
      props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
      props.extensions = [...(props.extensions || []), new ClipExtension()];
    }

    return super.renderSubLayers(props);
  }

  onHover(info, pickingEvent) {
    const {uniqueIdProperty, autoHighlight} = this.props;

    if (autoHighlight) {
      const {hoveredFeatureId} = this.state;
      const hoveredFeature = info.object;
      let newHoveredFeatureId;

      if (hoveredFeature) {
        newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      }

      if (hoveredFeatureId !== newHoveredFeatureId) {
        this.setState({hoveredFeatureId: newHoveredFeatureId});
      }
    }

    return super.onHover(info, pickingEvent);
  }

  getHighlightedObjectIndex(tile) {
    const {hoveredFeatureId} = this.state;
    const {uniqueIdProperty, highlightedFeatureId} = this.props;
    const {data} = tile;

    const isFeatureIdPresent =
      isFeatureIdDefined(hoveredFeatureId) || isFeatureIdDefined(highlightedFeatureId);

    if (!isFeatureIdPresent || !Array.isArray(data)) {
      return -1;
    }

    const featureIdToHighlight = isFeatureIdDefined(highlightedFeatureId)
      ? highlightedFeatureId
      : hoveredFeatureId;

    return data.findIndex(
      feature => getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight
    );
  }
}

function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if ('id' in feature) {
    return feature.id;
  }

  return -1;
}

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
