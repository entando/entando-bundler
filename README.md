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

To generate a bundle you can use the `generate` command. Check the details for the generate command
```
entando-bundle generate --help
```


