const _ = require('lodash');
const base64Img = require('base64-img');
const {Bundle, Tag, Details} = require('./models');

function validateModuleName(name) {
    const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)?$/gm
    return regex.test(name);
}

function generateModuleName(name, fallbackModule) {
    let moduleName = name;
    if (!moduleName) {
        moduleName = cleanModuleName(fallbackModule)
    }
    if (!validateModuleName(moduleName)) {
        throw `Module name ${name} is not valid, please provide a custom name that respects this regex ${regex}`;
    }
    return moduleName;
}

function cleanModuleName(module) {
    let name = module.name;
    if (name.startsWith('@')) {
        let scopeEnd = name.indexOf('/',0);
        name = `${name.substr(1, scopeEnd-1)}-${name.substr(scopeEnd+1)}`;
    }
    return name;
}

async function generateThumbnail(options) {
    return new Promise((resolve, reject)=>{
        if(options.thumbnailFile) {
            base64Img.base64(options.thumbnailFile, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            })
        } else if(options.thumbnailUrl) {
            base64Img.requestBase64(options.thumbnailUrl, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                resolve(body);
            })
        }
    });
}

async function convertToEntandoDeBundle(modules, options) {
    let modulesToConvert = modules;
    if (!_.isArray(modulesToConvert)) {
        modulesToConvert = [modulesToConvert];
    }
    const detailsInfo = modulesToConvert[0];
    const name = generateModuleName(options.name, detailsInfo);
    const metadata = {
        'name': name,
        ...(options.namespace && { 'namespace': options.namespace })
    };
    if (options.thumbnailFile || options.thumbnailUrl) {
        detailsInfo.thumbnail = await generateThumbnail(options);
    }
    const details = Details(detailsInfo);
    const tags = modulesToConvert.map(m => Tag(m))
        .filter(t => !_.isEmpty(t));


    return Bundle(metadata, details, tags);
}

module.exports = {
    validateModuleName,
    cleanModuleName,
    generateModuleName,
    convertToEntandoDeBundle
}