#!/bin/bash

node ./bin/index.js from-git $PACKAGE --dry-run --registry=$REGISTRY --name=$NAME --namespace=$NAMESPACE

