import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';

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
  class TestCartoSQLLayer extends CartoSQLLayer {
    _updateTileJSON() {
      // override internal method to avoid remote calls
    }
  }

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

  testLayer({Layer: TestCartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});
