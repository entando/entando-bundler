const bundle = require('../lib/de_bundle');
const { readFile } = require('./utils');
const mockedNpmResponses = require('./npm_response_mock');

describe('Bundle naming', () => {
  const testCases = {
    'http://www.github.com/entando/my-bundle.git': 'my-bundle.entando.www.github.com',
    'http://github.com/entando/my-bundle.git': 'my-bundle.entando.github.com',
    'http://www.github.com/entando/my-bundle': 'my-bundle.entando.www.github.com',
    'http://.github.com/entando/my-bundle': 'my-bundle.entando..github.com',
    'http://www.github.com/entando/my-bundle.': 'my-bundle..entando.www.github.com',
    'http://www.github.com./entando/my-bundle.': 'my-bundle..entando.www.github.com',
    'http://www.github.com/entando/.my-bundle': 'my-bundle.entando.www.github.com',
    'http://github.com/entando/my-bundle/': 'my-bundle.entando.github.com',
    'http://www.github.com/entando/my-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundle':
      'my-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemymy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundlemy-bundle.entando.www',
  };

  Object.entries(testCases).forEach(function (keyValue) {
    it('Should generate the expected moduleName', () => {
      expect(bundle.generateModuleName(keyValue[0])).toBe(keyValue[1]);
    });
  });
});

describe('Bundle convertion', () => {
  it('Should take the name from first module if no custom name is provided', async () => {
    const b = await bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.allVersions, {});
    expect(b.metadata.name).toBe('entando-menu');
  });

  it('Should use custom name', async () => {
    const b = await bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.allVersions, { name: 'my-entando' });
    expect(b.metadata.name).toBe('my-entando');
  });

  it('Should throw an error if the bundle name is not valid', async () => {
    await expect(bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.singleVersionInvalidName)).rejects.toThrow();
  });

  it('Should use custom name only for k8s metadata, bundle name is not changed', async () => {
    const b = await bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.allVersions, { name: 'my-name' });
    expect(b.metadata.name).toBe('my-name');
    expect(b.spec.details.name).toBe('@entando/menu');
  });

  it('Should generate details based on module infos', async () => {
    const allVersions = mockedNpmResponses.allVersions;
    const refVersion = allVersions[0];
    const b = await bundle.convertNpmModuleToEntandoDeBundle(allVersions, {});
    const expectObject = {
      name: '@entando/menu',
      description: refVersion.description,
      'dist-tags': refVersion['dist-tags'],
      time: refVersion.time,
      versions: refVersion.versions,
      keywords: refVersion.keywords,
      repository: refVersion.repository,
      maintainers: refVersion.maintainers,
    };
    expect(b.spec.details).toMatchObject(expectObject);
  });

  it('Should generate a number of tags equal to the number of versions available', async () => {
    const allVersions = mockedNpmResponses.allVersions;
    const b = await bundle.convertNpmModuleToEntandoDeBundle(allVersions, {});
    expect(b.spec.tags).toHaveLength(allVersions[0].versions.length);
  });

  it('Should contains the latest dist-tag in the tags', async () => {
    const allVersions = mockedNpmResponses.allVersions;
    const b = await bundle.convertNpmModuleToEntandoDeBundle(allVersions, {});
    const expectedTag = {
      version: '2.0.0',
      integrity: 'sha512-hG2S0CP716VH6urSd17MT2vpOQJt77yOfDQSTF0hOm60rUuyUFEHpkY5cJ2XI7yLJHQRrOkn7zRR8/uB4VuWPQ==',
      shasum: 'f6f0dc9ffce44871f688275b437d32699a52ff6d',
      tarball: 'https://registry.npmjs.org/@entando/menu/-/menu-2.0.0.tgz',
      fileCount: 17,
      unpackedSize: 44200,
      'npm-signature':
        '-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJdS908CRA9TVsSAnZWagAA+u0P/0KS8PUDMc8Y0qNP4o5N\niQvlg+E/B7hxWZUjNsx7XxfmhgYMf0aItiojZ2/oaonmm8jLg60t1W1UbUhF\nu4iIkX9YNakrVTL8WnXHNeMUqMDlZiaPnc6K24ENr3uTaccvQ2d8Fe7nRMdA\nrIQTdTUvrioA9lXGBRMZCwzY0AOy7eZqs2gln037rVWJX3vgb77aUVNjuTRa\nZCwrssT9JpdAI6XC/BhCeldakMFXoUkSvzbkeTIT4WmiZecVpkS1Jnwi4+7F\nVcNXGqPn3CS4+QRbCHFgRl8vZuSJ1sCdXNMJ2iRiqU4hRbQmGhKygAyIpMPT\nTsne5pylvxZBKRBKtHZGcsz7m0v/GHV9tl4B42uFqR8dCdDKtf37juXBkktR\npHt4ti5PzGWKJ3cdE9gk1r8fQzrpvcV6U4TTAg/Ujh2s0vdFUfkp8IRKVYdg\nzktCOarQVTe0xUuDM6AIGJVf7amBBwDAyOZEWYNKLlftv1PC/EMMfozph42F\nP8zhxAf9Rf170vK8sY6NLJJ7DGyxCL5wTtvodeNVu+EGvR/bGha2Hh1poaYP\ngP4XJjmdOvntNiqdtMVuR3UxTB9EJzg/D55T/ZqWcCkt8KqwkOEl2rZ+uY4a\n6wYFXJ/w6FDH/5z2I8Am5em/6JzMs/An0ebjVNDh+InDhSTWnaodVfO/60Vj\nA1GU\r\n=MkBb\r\n-----END PGP SIGNATURE-----\r\n',
    };
    expect(b.spec.tags).toEqual(expect.arrayContaining([expectedTag]));
  });

  it('Should use the provided namespace', async () => {
    const b = await bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.allVersions, { namespace: 'test-namespace' });
    expect(b.metadata.namespace).toBe('test-namespace');
  });

  it('Should use the provided image as thumbnail', async () => {
    const b = await bundle.convertNpmModuleToEntandoDeBundle(mockedNpmResponses.allVersions, { thumbnailFile: 'test/entando-thumb.jpeg' });
    const expectedContent = await readFile('test/entando-thumb-base64enc');
    expect(b.spec.details.thumbnail).toBe(expectedContent);
  });
});
