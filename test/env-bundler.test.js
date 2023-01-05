const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const process = require('process');

const widgets = require('./mocks/widgets');
const widget = require('./mocks/widget');
const resourceFile = require('./mocks/resource-file');
const resourceDirectory = require('./mocks/resource-directory');

const { setupEnvironment, collectAllComponents, generateBundle, ALL_TYPES } = require('../lib/env-bundler');

jest.mock('axios');

describe('env-bundler', function () {
  const testDir = process.cwd();
  let tmpDir;
  let envFile;

  beforeEach(async () => {
    // create test env.json file
    tmpDir = path.resolve(os.tmpdir(), 'env-bundler-test');
    fs.mkdirSync(tmpDir);
    envFile = path.resolve(tmpDir, 'env.json');
    fs.writeFileSync(envFile, JSON.stringify({
      coreBaseApi: 'http://my-server/entando-de-app',
      clientId: 'my-client-id',
      clientSecret: 'my-client-secret',
      componentManagerApi: 'http://my-server/digital-exchange',
    }));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(testDir);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('Should save resources skipping the directories', async () => {
    await setupSuccess();

    for (const componentType of ALL_TYPES) {
      if (componentType === 'widget') {
        axios.get.mockImplementationOnce(() => Promise.resolve({ data: widgets }));
      } else {
        axios.get.mockImplementationOnce(() => Promise.resolve({ data: { payload: [] } }));
      }
    }

    axios.get.mockImplementationOnce(() => Promise.resolve({ data: widget }));
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: resourceFile }));
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: resourceDirectory }));

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

    expect(axios.get).toHaveBeenNthCalledWith(16,
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget/static/css/main.dbf0c21a.css'),
      expect.any(Object),
    );
    expect(axios.get).toHaveBeenNthCalledWith(17,
      expect.stringContaining('/api/fileBrowser/file?protectedFolder=false&currentPath=bundles/my-bundle/widgets/my-widget'),
      expect.any(Object),
    );
  });

  it('Should display message about invalid certificate', async () => {
    const axiosError = new Error('self signed certificate');
    axiosError.isAxiosError = true;
    axios.get.mockImplementationOnce(() => Promise.reject(axiosError));

    await expect(setupEnvironment({
      env: envFile,
      excludeMicroservices: true,
    })).rejects.toThrow('Invalid certificate detected. Use the --no-tls-verify flag to skip TLS validation');
  });

  async function setupSuccess () {
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
  }
});
