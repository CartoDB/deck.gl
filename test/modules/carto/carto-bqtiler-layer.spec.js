import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoBQTilerLayer} from '@deck.gl/carto';

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

test('CartoBQTilerLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoBQTilerLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoBQTilerLayer#_updateTileJSON', t => {
  const testCases = [
    {
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.notOk(spies._updateTileJSON.called, 'no data, no map instantiation');
        t.ok(spies._updateTileJSON.callCount === 0);
      }
    },
    {
      updateProps: {data: 'project.dataset.tileset_table_name'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(spies._updateTileJSON.called, 'initial data triggers map instantiation');
        t.ok(spies._updateTileJSON.callCount === 1);
      }
    },
    {
      updateProps: {data: 'project.dataset.tileset_table_name'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._updateTileJSON.callCount === 0,
          'same data does not trigger a new map instantiation'
        );
      }
    },
    {
      updateProps: {data: 'project.dataset.ANOTHER_tileset_table_name'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._updateTileJSON.callCount === 1,
          'different data triggers a new map instantiation'
        );
      }
    }
  ];

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoBQTilerLayer#autoExtent with no bounds info from TileJSON', t => {
  const testCases = [
    {
      updateProps: {autoExtent: true, extent: null},
      spies: ['updateState'],
      onAfterUpdate({subLayers}) {
        t.ok(
          subLayers.every(l => arrayEquals(l.props.extent, [-180, -90, 180, 90])),
          'autoExtent set the default extent value'
        );
      }
    }
  ];

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoBQTilerLayer#autoExtent with bounds info from TileJSON', t => {
  class TestCartoBQTilerLayer extends CartoBQTilerLayer {
    updateState(opts) {
      super.updateState(opts);
      this.setState({
        tilejson: {
          bounds: [-20, -20, 20, 20]
        }
      });
    }
  }
  TestCartoBQTilerLayer.componentName = 'TestCartoBQTilerLayer';

  const testCases = [
    {
      updateProps: {autoExtent: true, extent: null},
      spies: ['updateState'],
      onAfterUpdate({subLayers}) {
        t.ok(
          subLayers.every(l => arrayEquals(l.props.extent, [-20, -20, 20, 20])),
          'autoExtent set the extent value using the data provided by the TileJSON metadata'
        );
      }
    },
    {
      updateProps: {autoExtent: true, extent: [-10, -10, 10, 10]},
      spies: ['updateState'],
      onAfterUpdate({subLayers}) {
        t.ok(
          subLayers.every(l => arrayEquals(l.props.extent, [-10, -10, 10, 10])),
          "autoExtent doesn't overwrite defined extent value"
        );
      }
    },
    {
      updateProps: {autoExtent: false, extent: null},
      spies: ['updateState'],
      onAfterUpdate({subLayers}) {
        t.ok(
          subLayers.every(l => l.props.extent === null),
          "autoExtent doesn't modify extent when disabled"
        );
      }
    }
  ];

  testLayer({Layer: TestCartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});
