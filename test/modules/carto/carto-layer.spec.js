import test from 'tape-catch';
import {generateLayerTests, testLayer} from '@deck.gl/test-utils';
import {
  setConfig,
  CartoLayer,
  CartoSQLLayer,
  CartoBQTilerLayer,
  _CartoCloudNativeLayer
} from '@deck.gl/carto';

function setCartoConfig({isCloudNative}) {
  if (isCloudNative) {
    setConfig({
      mode: 'carto-cloud-native',
      tenant: 'whatever-tenant',
      accessToken: 'whatever-access-token'
    });
  } else {
    setConfig({
      mode: 'carto',
      username: 'whatever-user-name',
      apiKey: 'whatever-api-key'
    });
  }
}

test('CartoLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});

test('should render a CartoCloudNativeLayer as sublayer', t => {
  const testCases = [
    {
      props: {
        mode: 'carto-cloud-native',
        type: 'sql'
      },
      onBeforeUpdate: () => {
        setCartoConfig({isCloudNative: true});
      },
      onAfterUpdate: ({subLayer}) => {
        t.ok(
          subLayer instanceof _CartoCloudNativeLayer,
          'subLayer should be a CartoCloudNativeLayer layer'
        );
      }
    }
  ];

  testLayer({Layer: CartoLayer, testCases, onError: t.notOk});

  t.end();
});

test('should render a CartoSQLLayer as sublayer', t => {
  const testCases = [
    {
      props: {
        mode: 'carto',
        type: 'sql'
      },
      onBeforeUpdate: () => {
        setCartoConfig({isCloudNative: false});
      },
      onAfterUpdate: ({subLayer}) => {
        if (subLayer) {
          t.ok(subLayer instanceof CartoSQLLayer, 'subLayer should be a CartoSQLLayer layer');
        }
      }
    }
  ];

  testLayer({Layer: CartoLayer, testCases, onError: t.notOk});

  t.end();
});

test('should render a CartoBQTilerLayer as sublayer', t => {
  const testCases = [
    {
      props: {
        mode: 'carto',
        type: 'tileset'
      },
      onBeforeUpdate: () => {
        setCartoConfig({isCloudNative: false});
      },
      onAfterUpdate: ({subLayer}) => {
        if (subLayer) {
          t.ok(
            subLayer instanceof CartoBQTilerLayer,
            'subLayer should be a CartoBQTilerLayer layer'
          );
        }
      }
    }
  ];

  testLayer({Layer: CartoLayer, testCases, onError: t.notOk});

  t.end();
});
