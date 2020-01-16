# DigitalExchange CLI

## Purpose
This CLI application has the purpose of generate Entando Bundles for the Digital-Exchange using NPM as supporting technology for modules and registry

## Getting started

### Setup a local registry with Nexus

As a registry you can use whatever technology you prefer. Some examples are the [NPM official registry](https://npmjs.org), [Verdaccio](https://github.com/verdaccio/verdaccio) or [Nexus](https://github.com/sonatype/nexus-public)

For development purposes, let's start a local Nexus repository and set it up as NPM registry

### Steps

Start by running Nexus as a docker container using the docker command or the docker-compose.yml file available in the docker folder:
```
docker run -d -p 8081:8081 --name nexus sonatype/nexus3
```

Nexus should be available at your localhost at  port 8081

Now you need to sign-in as an admin to configure Nexus and make it usable as a private npm repository. To do so, you need to get the admin credential from inside the container.

```
docker exec -it nexus /bin/bash

cat nexus-data/admin.password
```



