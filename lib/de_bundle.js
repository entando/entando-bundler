const _ = require('lodash');
const {Bundle, Tag, Details} = require('./models');

function generateModuleName(name, fallbackModule) {
    if (!name) {
        name = cleanModuleName(fallbackModule)
    }
    return name;
}

function cleanModuleName(module) {
    let name = module.name;
    if (name.startsWith('@')) {
        let scopeEnd = name.indexOf('/',0);
        name = name.substr(scopeEnd+1);
    }
    return name;
}

function convertToEntandoDeBundle(modules, options) {
    if (!_.isArray(modules)) {
        modules = [modules];
    }
    const name = generateModuleName(options.bundleName, modules[0]);
    const metadata = {
        'name': name,
        ...(options.bundleNamespace && { 'namespace': options.bundleNamespace })
    };
    const details = Details(modules[0]);
    const tags = modules.map(m => Tag(m))
        .filter(t => !_.isEmpty(t));


    return Bundle(metadata, details, tags);
}

module.exports = {
    convertToEntandoDeBundle
}