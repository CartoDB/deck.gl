import {getMapsVersion} from '../config';

/**
 * Simple GET request
 */
function getRequest(url) {
  // eslint-disable-next-line no-undef
  return new Request(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
}

/**
 * Simple POST request
 */
function postRequest(url, accessToken, payload) {
  // eslint-disable-next-line no-undef
  return new Request(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Request against Maps API
 */
export async function request({url, credentials, source, connection, isPost = false}) {
  let response;

  try {
    /* global fetch */
    /* eslint no-undef: "error" */
    const requestMethod = isPost
      ? postRequest(url, credentials.accessToken, {source, connection})
      : getRequest(url);
    response = await fetch(requestMethod);
  } catch (error) {
    throw new Error(`Failed to connect to Maps API: ${error}`);
  }

  const json = await response.json();

  if (!response.ok) {
    dealWithError({response, json, credentials});
  }

  return json;
}

/**
 * Display proper message from Maps API error
 */
function dealWithError({response, json, credentials}) {
  switch (response.status) {
    case 401:
      throw new Error(
        `Unauthorized access to Maps API: invalid combination of user ('${
          credentials.username
        }') and apiKey ('${credentials.apiKey}')`
      );
    case 403:
      throw new Error(
        `Unauthorized access to dataset: the provided apiKey('${
          credentials.apiKey
        }') doesn't provide access to the requested data`
      );

    default:
      const e = getMapsVersion() === 'v1' ? JSON.stringify(json.errors) : json.error;
      throw new Error(e);
  }
}

/**
 * Simple encode parameter
 */
export function encodeParameter(name, value) {
  return `${name}=${encodeURIComponent(value)}`;
}
