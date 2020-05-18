const childProcess = require('child_process');

const mockParsedDescriptor = require('./descriptor');
const repositoryBundler = require('../lib/repository');

jest.mock('child_process');

const REPO = 'https://github.com/entando-k8s/entando-sample-bundle.git';

describe('Repository bundler module\'s cloneRepository()', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec.mockImplementation((cmd, opts, cb) => cb(null, '', ''));
  });

  it('should not run the clone command if repository is not provided', async () => {
    await expect(repositoryBundler.cloneRepository()).rejects.toEqual(expect.any(Error));
  });

  it('should run the git clone command if repository is provided', () => {
    repositoryBundler.cloneRepository({
      repository: REPO,
    });

    const execCommand = childProcess.exec;
    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(execCommand.mock.calls[0][0]).toMatch(`git clone ${REPO}`);
  });
});

describe('Repository bundler module\'s removeRepository()', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec.mockImplementation((cmd, opts, cb) => cb(null, 'test', ''));
  });

  it('should run the rm -fr command if repository is provided', () => {
    repositoryBundler.removeRepository();

    const execCommand = childProcess.exec;
    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(execCommand.mock.calls[0][0]).toMatch('rm -fr');
  });

  it('should pass through the object it gets as parameter', async () => {
    const passedObject = { test: 'object' };
    const executed = repositoryBundler.removeRepository(passedObject);
    const execCommand = childProcess.exec;

    expect(execCommand).toHaveBeenCalledTimes(1);
    await expect(executed).resolves.toBe(passedObject);
  });
});

describe('Repository bundler module\'s getDescriptorData()', function () {
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec.mockImplementation((cmd, opts, cb) => cb(null, '', ''));
  });

  it('should parse test descriptor.yaml to JS object', async () => {
    const executed = repositoryBundler.getDescriptorData({
      repositoryPath: 'test/',
    });
    await expect(executed).resolves.toStrictEqual(mockParsedDescriptor);
  });
});

describe('Repository bundler module\'s getRepositoryData()', function () {
  const MOCK_GIT_TAGS_STDOUT = '1.0.0\n1.1.1\nv1.2.3\nsome-feature-tag\n0.0.1-rc';
  const MOCK_GIT_TAGS_PARSED = JSON.stringify(['1.0.0', '1.1.1', '0.0.1-rc']);
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec
      .mockImplementationOnce((cmd, opts, cb) => cb(null, MOCK_GIT_TAGS_STDOUT, '')) // tagListPromise
      .mockImplementationOnce((cmd, opts, cb) => cb(null, REPO, '')); // repositoryFetchUrlPromise
  });

  it('should run git tag and git remote get-url commands', async () => {
    repositoryBundler.getRepositoryData();

    const execCommands = childProcess.exec;

    expect(execCommands).toHaveBeenCalledTimes(2);
    expect(execCommands.mock.calls[0][0]).toMatch('git tag');
    expect(execCommands.mock.calls[1][0]).toMatch('git remote get-url');
  });

  it('should parse and filter git tags', async () => {
    const repositoryData = await repositoryBundler.getRepositoryData();

    expect(JSON.stringify(repositoryData.tags)).toEqual(MOCK_GIT_TAGS_PARSED);
  });

  it('should pass first tag as latest tag', async () => {
    const repositoryData = await repositoryBundler.getRepositoryData();

    expect(repositoryData.latestTag).toEqual(repositoryData.tags[0]);
  });

  it('should pass through the object it gets as parameter', async () => {
    const passedObject = { test: 'object' };
    const executed = repositoryBundler.removeRepository(passedObject);
    const execCommand = childProcess.exec;

    expect(execCommand).toHaveBeenCalledTimes(1);
    await expect(executed).resolves.toBe(passedObject);
  });
});
