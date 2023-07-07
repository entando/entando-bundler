const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const process = require('process');
const yaml = require('yaml');

const widgets = require('./mocks/widgets');
const widget = require('./mocks/widget');
const fragments = require('./mocks/fragments');
const resourceFile = require('./mocks/resource-file');
const resourceDirectory = require('./mocks/resource-directory');

const { setupEnvironment, collectAllComponents, generateBundle } = require('../lib/env-bundler');

const apiUrlTable = {
  widget: /\/api\/widgets/,
  widgetDetails: /\/api\/widgets\/.+/,
  fragments: /\/api\/fragments/,
  resource: /\/api\/fileBrowser?protectedFolder=false&currentPath=.+/,
  resourceDetails: /\/api\/fileBrowser\/file\?protectedFolder=false&currentPath=.+/,
};

jest.mock('axios');

class AxiosMock {
  static async mockGetCalls () {
    await axios.get.mockImplementation((url) => {
      switch (true) {
        case apiUrlTable.widget.test(url):
          return Promise.resolve({ data: widgets });
        case apiUrlTable.widgetDetails.test(url):
          return Promise.resolve({ data: widget });
        case apiUrlTable.fragments.test(url):
          return Promise.resolve({ data: fragments });
        case apiUrlTable.resourceDetails.test(url):
          return Promise.resolve({ data: resourceFile });
        case apiUrlTable.resource.test(url):
          return Promise.resolve({ data: resourceDirectory });
        default:
          return Promise.resolve({ data: { payload: [] } });
      }
    });
  }
}

describe('env-bundler', function () {
  let tmpDir;

  beforeEach(async () => {
    // create test env.json file
    tmpDir = path.resolve(os.tmpdir(), 'env-bundler-test');
    fs.mkdirSync(tmpDir);
    const envFile = path.resolve(tmpDir, 'env.json');
    fs.writeFileSync(envFile, JSON.stringify({
      coreBaseApi: 'http://my-server/entando-de-app',
      clientId: 'my-client-id',
      clientSecret: 'my-client-secret',
      componentManagerApi: 'http://my-server/digital-exchange',
    }));

    // mock token
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { 'auth-server-url': 'http://keycloak-server' } }));
    axios.post.mockImplementationOnce(() => Promise.resolve({ data: { access_token: 'token' } }));

    // mock default language
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        payload: [{ code: 'en', isDefault: true }],
      },
    }));

    await setupEnvironment({
      env: envFile,
      excludeMicroservices: true,
    });

    process.chdir(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('Should save resources skipping the directories', async () => {
    await AxiosMock.mockGetCalls();

    await collectAllComponents();

    const options = {
      generateBundle: true,
      location: './',
      code: 'test-directories',
      description: 'test-directories',
    };
    const components = {
      widget: ['my-widget'],
    };

    await generateBundle(options, components);

    const expectedDescriptor = path.resolve(tmpDir, 'descriptor.yaml');
    const expectedWidgetDescriptor = path.resolve(tmpDir, 'widgets', 'my-widget-descriptor.yaml');
    const expectedResource = path.resolve(tmpDir, 'resources', 'bundles', 'my-bundle', 'widgets', 'my-widget', 'static', 'css', 'main.dbf0c21a.css');

    expect(fs.existsSync(expectedDescriptor)).toBe(true);
    expect(fs.existsSync(expectedWidgetDescriptor)).toBe(true);
    expect(fs.existsSync(expectedResource)).toBe(true);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget/static/css/main.dbf0c21a.css'),
      expect.any(Object),
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget'),
      expect.any(Object),
    );
  });

  it('Should save fragment filtering out those with hyphen in the code', async () => {
    await AxiosMock.mockGetCalls();

    const components = await collectAllComponents();

    const options = {
      generateBundle: true,
      location: './',
      code: 'test-directories',
      description: 'test-directories',
    };

    await generateBundle(options, components);

    const expectedDescriptor = path.resolve(tmpDir, 'descriptor.yaml');
    const expectedWidgetDescriptor = path.resolve(tmpDir, 'widgets', 'my-widget-descriptor.yaml');
    const expectedResource = path.resolve(tmpDir, 'resources', 'bundles', 'my-bundle', 'widgets', 'my-widget', 'static', 'css', 'main.dbf0c21a.css');

    expect(fs.existsSync(expectedDescriptor)).toBe(true);
    expect(fs.existsSync(expectedWidgetDescriptor)).toBe(true);
    expect(fs.existsSync(expectedResource)).toBe(true);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget/static/css/main.dbf0c21a.css'),
      expect.any(Object),
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget'),
      expect.any(Object),
    );

    const descUtf8 = fs.readFileSync(path.resolve(tmpDir, 'descriptor.yaml'), 'utf8');
    const descriptor = yaml.parse(descUtf8);

    const actualFragments = await getFragments();
    expect(descriptor.components.fragments.length).toBe(actualFragments.length);
    const actualCodesOfFragments = actualFragments.map(f => f.code);
    expect(actualCodesOfFragments.includes('-')).toBe(false);
  });

  async function getFragments () {
    const fragmentList = fs.readdirSync(path.resolve(tmpDir, 'fragments'));
    const promises = fragmentList.map(fragmentFileName => {
      const fragmentDescUtf8 = fs.readFileSync((path.resolve(tmpDir, 'fragments', fragmentFileName)), 'utf8');
      return yaml.parse(fragmentDescUtf8);
    });

    return Promise.all(promises);
  }
});
