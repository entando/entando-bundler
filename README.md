# Entando Bundle CLI

## Purpose
This CLI application has the purpose of converting EntandoBundles published as an NPM module into EntandoDEBundle custom resource for Entando 6 digital-exchange consumption

For details on EntandoBundles structure, how to compose them and publish them to an NPM registry, please refer to the documentation in the [entando-sample-bundle](https://github.com/entando-k8s/entando-sample-bundle)

## Install the CLI globally
To install the tool globally for development
```
npm install -g ./
```

This CLI tool is able to convert npm module(s) into EntandoDeBundle custom resources. You can see the help for the tool by invoking the `--help` command

```
entando-bundle --help
```

To generate a bundle using npm repository you can use the `from-npm` command. Check the details for the generate command
```
entando-bundle from-npm --help
```

To generate a bundle using git repository you can use the `from-git` command. Check the details for the generate command
```
entando-bundle from-git --help
```


### entando-bundle from-git

`--repository` option will clone the repository to `/tmp/tmp-ecr-bundle-repo_<TIMESTAMP>` folder, gather the needed information and will remove the folder.

`--repository-path` option will work with repository under provided path. To work with repository that is at working dir, just provide `--repository-path=.` as an option. If both `--repository` and `--repository-path` are provided - `--repository` takes precedence and `--repository-path` is ignored.

`descriptor.yaml` is expected to be at the root of repository or repository path.

> We recommend you running the `entando-bundle from-git` command using `--repository` option as this will ensure that repository has the latest changes (code and tags wise) from all contributors.

### Tag sorting and filtration

Currently, tags are sorted using semver logic and are filtered out using  `/^\d+\.\d+.\d+/` regex, which would match tags like: `2.0.0`, `1.0.12`, `2.0.1-rc`, etc.
