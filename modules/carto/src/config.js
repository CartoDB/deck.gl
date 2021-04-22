export const MODE_TYPES = Object.freeze({
  CARTO: 'carto',
  CARTO_CLOUD_NATIVE: 'carto-cloud-native'
});

const CARTO_REQUIRED_PROPS = Object.freeze({
  username: 'username',
  apiKey: 'apiKey'
  // region: 'region'
});

const CARTO_CLOUD_NATIVE_REQUIRED_PROPS = Object.freeze({
  // email: 'email',
  accessToken: 'accessToken',
  tenant: 'tenant'
});

let configProps = {};

export function setConfig(props) {
  checkConfigProps(props);

  configProps = props;
}

export function getConfig() {
  return configProps;
}

function checkConfigProps(opts) {
  if (!isModeAllowed(opts)) {
    throw new Error(
      `CARTO config error: "mode" is required, use "${MODE_TYPES.CARTO}" or "${
        MODE_TYPES.CARTO_CLOUD_NATIVE
      }"`
    );
  }

  if (!arePropsAllowed(opts)) {
    if (opts.mode === MODE_TYPES.CARTO) {
      throw new Error(
        `CARTO config error: "${
          MODE_TYPES.CARTO
        }" "mode" has the following required config props: ${Object.values(
          CARTO_REQUIRED_PROPS
        ).toString()}`
      );
    }

    throw new Error(
      `CARTO config error: "${
        MODE_TYPES.CARTO_CLOUD_NATIVE
      }" "mode" has the following required config props: ${Object.values(
        CARTO_CLOUD_NATIVE_REQUIRED_PROPS
      ).toString()}`
    );
  }
}

export function isModeAllowed(opts) {
  const mode = opts.mode;

  if (!mode) {
    return false;
  }

  if (mode !== MODE_TYPES.CARTO && mode !== MODE_TYPES.CARTO_CLOUD_NATIVE) {
    return false;
  }

  return true;
}

function arePropsAllowed(opts) {
  if (opts.mode === MODE_TYPES.CARTO && !hasAllowedProps(CARTO_REQUIRED_PROPS, opts)) {
    return false;
  }

  if (
    opts.mode === MODE_TYPES.CARTO_CLOUD_NATIVE &&
    !hasAllowedProps(CARTO_CLOUD_NATIVE_REQUIRED_PROPS, opts)
  ) {
    return false;
  }

  return true;
}

function hasAllowedProps(obj1, obj2) {
  return Object.keys(obj1).every(prop => prop in obj2);
}

// setDefaultCredentials will be deprecated in following versions
const defaultCredentials = {
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  // Set to null to guess from mapsUrl attribute. Other values are 'v1' or 'v2'
  mapsVersion: null,
  // SQL API URL
  sqlUrl: 'https://{user}.carto.com/api/v2/sql',
  // Maps API URL
  mapsUrl: 'https://maps-api-v2.{region}.carto.com/user/{user}'
};

let credentials = defaultCredentials;

export function setDefaultCredentials(opts) {
  credentials = {
    ...credentials,
    ...opts
  };
}

export function getDefaultCredentials() {
  return credentials;
}

export function getMapsVersion(creds) {
  const {mapsVersion, mapsUrl} = {...credentials, ...creds};

  if (mapsVersion) {
    return mapsVersion;
  }

  return mapsUrl.includes('api/v1/map') ? 'v1' : 'v2';
}
