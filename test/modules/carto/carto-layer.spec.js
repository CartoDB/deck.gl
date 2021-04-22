import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {setConfig, CartoLayer} from '@deck.gl/carto';

test.only('CartoLayer', t => {
  setConfig({
    mode: 'carto-cloud-native',
    tenant: 'whatever-tenant',
    accessToken: 'whatever-token'
  });

  const testCases = generateLayerTests({
    Layer: CartoLayer,
    sampleProps: {
      mode: 'carto-cloud-native',
      type: 'sql'
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.ok(subLayer, 'subLayers rendered');
    }
  });

  testLayer({Layer: CartoLayer, testCases, onError: t.notOk});

  t.end();
});
