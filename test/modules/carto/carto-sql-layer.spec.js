import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

test('CartoSQLLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#_updateTileJSON', t => {
  const testCases = [
    {
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.notOk(spies._updateTileJSON.called, 'no data, no map instantiation');
        t.ok(spies._updateTileJSON.callCount === 0);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(spies._updateTileJSON.called, 'initial data triggers map instantiation');
        t.ok(spies._updateTileJSON.callCount === 1);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._updateTileJSON.callCount === 0,
          'same data does not trigger a new map instantiation'
        );
      }
    },
    {
      updateProps: {data: 'ANOTHER_TABLE'},
      spies: ['_updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies._updateTileJSON.callCount === 1,
          'different data triggers a new map instantiation'
        );
      }
    }
  ];

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#autoExtent with no bounds info from TileJSON', t => {
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

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#autoExtent with bounds info from TileJSON', t => {
  class TestCartoSQLLayer extends CartoSQLLayer {
    updateState(opts) {
      super.updateState(opts);
      this.setState({
        tilejson: {
          bounds: [-20, -20, 20, 20]
        }
      });
    }
  }
  TestCartoSQLLayer.componentName = 'TestCartoSQLLayer';

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

  testLayer({Layer: TestCartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});
