const childProcess = require('child_process');

const gitBundler = require('../lib/git-bundler');

jest.mock('child_process');

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
    expect(execCommand.mock.calls[0][0]).toMatch(`git clone -n ${REPO} . --depth 1`);
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
  const MOCK_GIT_TAGS_STDOUT = '1.0.0\n1.1.1\nv1.2.3\nsome-feature-tag\n0.0.1-rc';
  const MOCK_GIT_TAGS_PARSED = JSON.stringify(['1.0.0', '1.1.1', '0.0.1-rc']);
  beforeEach(() => {
    childProcess.exec.mockClear();
    childProcess.exec
      .mockImplementationOnce((cmd, opts, cb) => cb(null, MOCK_GIT_TAGS_STDOUT, '')); // tagListPromise
  });

  it('should run git tag and git remote get-url commands', async () => {
    gitBundler.getRepositoryData();

    const execCommands = childProcess.exec;

    expect(execCommands).toHaveBeenCalledTimes(1);
    expect(execCommands.mock.calls[0][0]).toMatch('git tag');
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
});
