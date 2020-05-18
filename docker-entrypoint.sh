#!/bin/bash

node ./bin/index.js from-npm $PACKAGE --dry-run --registry=$REGISTRY --name=$NAME --namespace=$NAMESPACE

