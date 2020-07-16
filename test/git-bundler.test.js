const childProcess = require('child_process');
const fs = require('fs');

const gitBundler = require('../lib/git-bundler');
const descriptors = require('./mocks/descriptors');

jest.mock('child_process');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

const REPO = 'https://github.com/entando-k8s/entando-sample-bundle.git';

describe('Repository bundler module\'s cloneRepository()', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec.mockImplementation((cmd, opts, cb) => cb(null, '', ''));
  });

  it('should not run the clone command if repository is not provided', async () => {
    await expect(gitBundler.cloneRepository()).rejects.toEqual(expect.any(Error));
  });

  it('should run the git clone command if repository is provided', () => {
    gitBundler.cloneRepository({
      repository: REPO,
    });

    const execCommand = childProcess.exec;
    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(execCommand.mock.calls[0][0]).toMatch(`git clone -n ${REPO} .`);
    expect(execCommand.mock.calls[0][0]).toMatch('git checkout HEAD descriptor.yaml');
  });
});

describe('Repository bundler module\'s removeRepository()', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec.mockImplementation((cmd, opts, cb) => cb(null, 'test', ''));
  });

  it('should run the rm -fr command if repository is provided', () => {
    gitBundler.removeRepository();

    const execCommand = childProcess.exec;
    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(execCommand.mock.calls[0][0]).toMatch('rm -fr');
  });

  it('should pass through the object it gets as parameter', async () => {
    const passedObject = { test: 'object' };
    const executed = gitBundler.removeRepository(passedObject);
    const execCommand = childProcess.exec;

    expect(execCommand).toHaveBeenCalledTimes(1);
    await expect(executed).resolves.toBe(passedObject);
  });
});

describe('Repository bundler module\'s getRepositoryData()', function () {
  describe('for repository with tags', function () {
    const MOCK_GIT_TAGS_STDOUT = 'refs/tags/v0.0.12,Thu Jul 16 13:11:40 2020 +0300\nrefs/tags/v0.0.2,Tue Jun 30 13:38:03 2020 +0300\nrefs/tags/v0.0.1,Mon Jun 22 11:15:27 2020 +0300\nrefs/tags/0.0.1,Mon Jun 22 11:15:27 2020 +0300\n';
    const MOCK_GIT_TAGS_PARSED = JSON.stringify([['v0.0.12', '2020-07-16T10:11:40.000Z'], ['v0.0.2', '2020-06-30T10:38:03.000Z'], ['v0.0.1', '2020-06-22T08:15:27.000Z'], ['0.0.1', '2020-06-22T08:15:27.000Z']]);

    beforeEach(() => {
      childProcess.exec.mockClear();
      childProcess.exec
        .mockImplementationOnce((cmd, opts, cb) => cb(null, MOCK_GIT_TAGS_STDOUT, '')); // tagListPromise
    });

    it('should run git tag and git remote get-url commands', async () => {
      gitBundler.getRepositoryData();

      const execCommands = childProcess.exec;

      expect(execCommands).toHaveBeenCalledTimes(1);
      expect(execCommands.mock.calls[0][0]).toMatch('git for-each-ref');
    });

    it('should parse and filter git tags', async () => {
      const repositoryData = await gitBundler.getRepositoryData();

      expect(JSON.stringify(repositoryData.tags)).toEqual(MOCK_GIT_TAGS_PARSED);
    });

    it('should pass first tag as latest tag', async () => {
      const repositoryData = await gitBundler.getRepositoryData();

      expect(repositoryData.latestTag).toEqual(repositoryData.tags[0]);
    });

    it('should pass through the object it gets as parameter', async () => {
      const passedObject = { test: 'object' };
      const executed = gitBundler.removeRepository(passedObject);
      const execCommand = childProcess.exec;

      expect(execCommand).toHaveBeenCalledTimes(1);
      await expect(executed).resolves.toBe(passedObject);
    });

    it('should skip git tags if --no-tags is provided', async () => {
      const repositoryData = await gitBundler.getRepositoryData({ tags: false });

      expect(repositoryData).toHaveProperty('tags', []);
      expect(repositoryData).toHaveProperty('latestTag', undefined);
      expect(repositoryData).toHaveProperty('fetchUrl', undefined);
    });
  });

  describe('for repository without tags', function () {
    const MOCK_GIT_TAGS_STDOUT = '';

    beforeEach(() => {
      childProcess.exec.mockClear();
      childProcess.exec
        .mockImplementationOnce((cmd, opts, cb) => cb(null, MOCK_GIT_TAGS_STDOUT, '')); // tagListPromise
    });

    it('should reject tagless repository', async () => {
      const executed = gitBundler.getRepositoryData({ tags: true });
      const execCommand = childProcess.exec;

      expect(execCommand).toHaveBeenCalledTimes(1);
      await expect(executed).rejects.toEqual(expect.any(Error));
    });

    it('should inform about --no-tags option', async () => {
      const executed = gitBundler.getRepositoryData({ tags: true });
      const execCommand = childProcess.exec;

      expect(execCommand).toHaveBeenCalledTimes(1);
      await expect(executed).rejects.toThrow('--no-tags');
    });

    it('should parse and filter git tags if --no-tags is provided', async () => {
      const repositoryData = await gitBundler.getRepositoryData({ tags: false });

      expect(repositoryData).toHaveProperty('tags', []);
      expect(repositoryData).toHaveProperty('latestTag', undefined);
      expect(repositoryData).toHaveProperty('fetchUrl', undefined);
    });
  });
});

describe('Repository bundler module\'s getDescriptorData()', function () {
  it('should convert plural componentType names', async () => {
    fs.promises.readFile.mockImplementationOnce(
      () => new Promise(resolve => resolve(descriptors.pluralDescriptor)),
    );
    const executed = gitBundler.getDescriptorData();

    await expect(executed).resolves.toHaveProperty('components.plugin');
    await expect(executed).resolves.not.toHaveProperty('components.plugins');
    await expect(executed).resolves.toHaveProperty('components.widget');
    await expect(executed).resolves.not.toHaveProperty('components.widgets');
    await expect(executed).resolves.toHaveProperty('components.fragment');
    await expect(executed).resolves.not.toHaveProperty('components.fragments');
    await expect(executed).resolves.toHaveProperty('components.contentType');
    await expect(executed).resolves.not.toHaveProperty('components.contentTypes');
    await expect(executed).resolves.toHaveProperty('components.pageTemplate');
    await expect(executed).resolves.not.toHaveProperty('components.pageTemplates');
    await expect(executed).resolves.toHaveProperty('components.contentTemplate');
    await expect(executed).resolves.not.toHaveProperty('components.contentTemplates');
  });

  it('should convert old nomenclature componentType names', async () => {
    fs.promises.readFile.mockImplementationOnce(
      () => new Promise(resolve => resolve(descriptors.oldNomenclatureDescriptor)),
    );
    const executed = gitBundler.getDescriptorData();

    await expect(executed).resolves.not.toHaveProperty('components.pageModel');
    await expect(executed).resolves.not.toHaveProperty('components.pageModels');
    await expect(executed).resolves.not.toHaveProperty('components.contentModel');
    await expect(executed).resolves.not.toHaveProperty('components.contentModels');
    await expect(executed).resolves.toHaveProperty('components.pageTemplate');
    await expect(executed).resolves.toHaveProperty('components.contentTemplate');
  });

  it('should skip componentTypes without resources', async () => {
    fs.promises.readFile.mockImplementationOnce(
      () => new Promise(resolve => resolve(descriptors.emptyDescriptor)),
    );
    const executed = gitBundler.getDescriptorData();

    await expect(executed).resolves.not.toHaveProperty('components.plugin');
    await expect(executed).resolves.not.toHaveProperty('components.widget');
    await expect(executed).resolves.not.toHaveProperty('components.fragment');
    await expect(executed).resolves.not.toHaveProperty('components.contentType');
    await expect(executed).resolves.not.toHaveProperty('components.pageTemplate');
    await expect(executed).resolves.not.toHaveProperty('components.contentTemplate');
  });
});
