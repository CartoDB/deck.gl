import {getConfig} from '../config';
import {encodeParameter, request} from './utils';
import {FORMATS} from './constants'

/**
 * Build a URL with all required parameters
 */
function buildURL({provider, type, source, connection, credentials, format}) {
  const encodedClient = encodeParameter('client', 'deck-gl-carto');
  const parameters = [encodedClient];
  
  parameters.push(encodeParameter('access_token', credentials.accessToken));
  parameters.push(encodeParameter('source',source))
  parameters.push(encodeParameter('connection',connection))

  if (format) {
    parameters.push(encodeParameter('format', format));
  }

  return `${credentials.tenant}/${provider}/${type}?${parameters.join('&')}`;
}


async function getMapMetadata({provider, type, source, connection, credentials}) {
  const url = buildURL({provider, type, source, connection, credentials});

  return await request({url, credentials});
}

function getUrlFromMetadata(metadata){
  if (metadata.size === undefined) {
    throw new Error('Undefined response size');
  }

  const priorizedFormats = [FORMATS.GEOJSON, FORMATS.JSON, FORMATS.TILEJSON];

  for (const format of priorizedFormats) {
    const m = metadata[format];

    if (m && !m.error && m.url) {
      return [m.url[0], format];
    }
  }

  throw new Error('Layer not available');

}

export async function getMap({provider, type, source, connection, credentials, format}) {
  const creds = {...getConfig(), ...credentials};

  if (format) {
    const formatUrl = buildURL({provider, type, source, connection, credentials: creds, format})
    return [await request({url: formatUrl, credentials: creds}), format];
  }

  const metadata = await getMapMetadata({provider, type, source, connection, credentials: creds});
  const [url, mapFormat] = await getUrlFromMetadata(metadata);
  return [await request({url, credentials: creds}), mapFormat];  
}
