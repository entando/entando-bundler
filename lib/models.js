const _ = require('lodash');

module.exports.Bundle = function(metadata = {}, details = {}, tags = []) {
    return {
        'apiVersion': 'entando.org/v1alpha1',
        'kind': 'EntandoDeBundle',
        'metadata': metadata,
        'specs': {
            'details': details,
            'tags': tags
        }
    }
}

module.exports.Details = function(meta = {}) {
    let metadata = {};
    if (!_.isEmpty(meta)) {
        metadata = {
            "name": meta.name,
            "description": meta.description,
            "dist-tags": meta['dist-tags'] || '',
            "time": meta.time,
            "versions": meta.versions,
            "keywords": meta.keywords,
            "repository": meta.repository,
            "author": meta.author || '',
            "maintainers": meta.maintainers,
        };
    }
    return _.pickBy(metadata);
}

module.exports.Tag = function(meta = {}) { 
    let tag = {}
    if (!_.isEmpty(meta)) {
        tag = {
            'version': meta.version,
            ...meta.dist
        }
    }
    return _.pickBy(tag);
}

