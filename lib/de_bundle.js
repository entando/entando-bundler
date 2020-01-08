const _ = require('lodash');
const {Bundle, Tag, Details} = require('./models');
const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm

function validateModuleName(name) {
    return regex.test(name);
}

function generateModuleName(name, fallbackModule) {
    if (!name) {
        name = cleanModuleName(fallbackModule)
    }
    if (!validateModuleName(name)) {
        throw `Module name is not valid, please provide a custom name that respects this regex ${regex}`;
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
    const name = generateModuleName(options.name, modules[0]);
    const metadata = {
        'name': name,
        ...(options.namespace && { 'namespace': options.namespace })
    };
    const details = Details(modules[0]);
    const tags = modules.map(m => Tag(m))
        .filter(t => !_.isEmpty(t));


    return Bundle(metadata, details, tags);
}

module.exports = {
    convertToEntandoDeBundle
}