# Entando Bundler

## Purpose
This application has the purpose of helping with operations regarding Entando Bundles.

It can be run as an interactive terminal application or as a single command for scripting.

At this moment, these are the supported functions:
- Converting an existing Bundle package from a Git repository or NPM registry (deprecated) into a Kubernetes Custom Resource (EntandoDeBundle).
- Creating a Bundle package based on an existing environment.

For details on EntandoBundle package structure or how to publish it to a Git repository, please refer to the documentation in the [entando-sample-bundle](https://github.com/entando-k8s/entando-sample-bundle).

Also check the [Standard Demo Bundle](https://github.com/entando/standard-demo-bundle) for a full example of a Bundle generated using this tool.

## Install
To install this tool globally:
```
npm install -g ./
```

## Usage

This tool can be ran both as an interactive terminal application ([inquirer.js](https://github.com/SBoudrias/Inquirer.js)) or as a single command for scripting purposes ([commander.js](https://github.com/tj/commander.js)).

`$ entando-bundler` for interactive or `$ entando-bundler <command> <options>` for single command

## Generating Bundles from an existing environment:
Create an `env.json` file with the configurations for the environment to extract the components:
```
{
    "coreBaseApi": "http://quickstart-sales-demo.lab.entando.org/entando-de-app",
    "k8ssvcApi": "http://quickstart-eci-sales-demo.lab.entando.org/k8s",
    "clientId": "entando-bundle-cli",
    "clientSecret": "<insert_secret_here>"
}
```

### Interactive command:
```
$ entando-bundle
? What do you want to do? Create a new bundle using components from an environment
? Please select an env.json file with the environment variables: env.json
? Which type of components do you want to add to the bundle? All components
Collecting all components from the provided environment...
Collecting widgets
Collecting pageModels
Collecting fragments
Collecting pages
Collecting contentTypes
Collecting contentModels
Collecting plugins
? Do you want to generate the Bundle with the selected components? Yes
? Where do you want to generate the Bundle? ./
? What's the code for the Bundle? standard-demo-bundle
? Please add a description to the Bundle: Standard Demo Bundle
Generating bundle...
```

### Single command:
```
$ entando-bundle from-env \
    --env env.json \
    --code standard-demo-bundle \
    --description "Standard Demo Bundle"
```

For more details, please refer to:
```
entando-bundle from-env --help
```

## Generate a Kubernetes Custom Resource (EntandoDeApp) from a git repository:
```
$ entando-bundle from-git \
	--thumbnail-file <thumbnail_file_path> \
	--name <bundle_code> \
	--namespace <k8s_namespace> \
	--repository <git_repository_url>
	--dry-run
```

`--repository` option will clone the repository to `/tmp/tmp-ecr-bundle-repo_<TIMESTAMP>` folder, gather the needed information and will remove the folder.

`descriptor.yaml` is expected to be at the root of the repository.

For more details, please refer to:
```
entando-bundle from-git help
```


### Tag sorting and filtration

Currently, tags are sorted using semver logic and are filtered out using  `/^v?\d+\.\d+.\d+/` regex, which would match tags like: `v2.0.0`, `v1.0.12`, `v2.0.1-rc`, etc.

### Thumbnails

Thumbnail URLs (`--thumbnail-url` option) have to be surrounded with quotation marks.

## (Deprecated) Generate a Kubernetes Custom Resource (EntandoDeApp) from an npm registry:
```
entando-bundle from-npm --help
```

