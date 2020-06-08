const npmBundler = require('../lib/npm-bundler');
const childProcess = require('child_process');

// Reference for this construct: https://stackoverflow.com/a/43790087/3449226
jest.mock('child_process', () => ({
  // eslint-disable-next-line standard/no-callback-literal
  exec: jest.fn((cmd, opts, cb) => cb(null, '', '')),
}));

describe('Registry module', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
  });

  it('Should return all versions even if a specific one is required', () => {
    const requestedModule = '@entando/menu@1.0.0';
    const allVersionModule = npmBundler.allModuleVersions(requestedModule);
    expect(allVersionModule).toBe('@entando/menu@*');
  });

  it('Should work even when no organization is provided', () => {
    const requestedModule = 'menu@1.0.0';
    const allVersionModule = npmBundler.allModuleVersions(requestedModule);
    expect(allVersionModule).toBe('menu@*');
  });

  it('Should work when nor organization or version are provided', () => {
    const requestedModule = 'menu';
    const allVersionModule = npmBundler.allModuleVersions(requestedModule);
    expect(allVersionModule).toBe('menu@*');
  });

  it('Should issue the npm command with all the available versions', () => {
    npmBundler.getBundleInfo({ name: '@entando/bundle@1.0.0' });
    const executed = childProcess.exec.mock.calls[0][0];
    expect(executed).toBe('npm view @entando/bundle@* --json');
  });

  it('Should issue the npm command using the provided registry', () => {
    const requestedRegistry = 'https://registry.npmjs.org';
    npmBundler.getBundleInfo({ name: '@entando/bundle@1.0.0', registry: requestedRegistry });
    const executed = childProcess.exec.mock.calls[0][0];
    expect(executed).toBe(`npm view @entando/bundle@* --json --registry=${requestedRegistry}`);
  });
});
