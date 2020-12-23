const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const objectMapper = require('object-mapper');
const axiosRetry = require('axios-retry');

// Configure retries when extracting data
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay});

var allAnswers = {};
var componentCache = {};

const ALL_TYPES = [
  'widget',
  'pageModel',
  'fragment',
  'page',
  'group',
  'contentType',
  'contentModel',
  'asset',
  'content',
  'plugin',
  'category',
  'label',
  'language',
];

var coreBaseApi, k8ssvcApi, clientId, clientSecret, apiUrlTable;

const componentDetailExtractors = {
  page: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.titles.en} (${c.code})` };
    }),
  pageModel: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.description} (${c.code})` };
    }),
  fragment: (components) =>
    components.map((c) => {
      return { value: c.code, name: c.code };
    }),
  widget: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.titles.en} (${c.code})` };
    }),
  contentType: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.name} (${c.code})` };
    }),
  contentModel: (components) =>
    components.map((c) => {
      return { value: c.id, name: `${c.description} (${c.id})` };
    }),
  content: (components) =>
    components.map((c) => {
      return { value: c.id, name: `${c.description} (${c.id})` };
    }),
  plugin: (components) =>
    components.map((c) => {
      return { value: c.name, name: `${c.image} (${c.name})` };
    }),
  asset: (components) =>
    components.map((c) => {
      return { value: c.correlationCode, name: `(${c.type}) ${c.path}` };
    }),
  group: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.name} (${c.code})` };
    }),
  category: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.titles.en} (${c.code})` };
    }),
  resource: (components) =>
    components.map((c) => {
      return { value: c.path, name: `${c.path}` };
    }),
  label: (components) =>
    components.map((c) => {
      return { value: c.key, name: `${c.titles.en} (${c.key})` };
    }),
  language: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.description} (${c.code})` };
    }),
};

const componentIdExtractors = {
  page: (c) => {
    return c.code;
  },
  pageModel: (c) => {
    return c.code;
  },
  fragment: (c) => {
    return c.code;
  },
  widget: (c) => {
    return c.code;
  },
  contentType: (c) => {
    return c.code;
  },
  contentModel: (c) => {
    return c.id;
  },
  content: (c) => {
    return c.id;
  },
  plugin: (c) => {
    return c.name;
  },
  asset: (c) => {
    return c.correlationCode;
  },
  group: (c) => {
    return c.code;
  },
  category: (c) => {
    return c.code;
  },
  resource: (c) => {
    return c.path;
  },
  label: (c) => {
    return c.key;
  },
  language: (c) => {
    return c.code;
  },
};

const componentCodeExtractors = {
  page: (c) => {
    return c.code;
  },
  pageModel: (c) => {
    return c.code;
  },
  fragment: (c) => {
    return c.code;
  },
  widget: (c) => {
    return c.code;
  },
  contentType: (c) => {
    return c.code;
  },
  contentModel: (c) => {
    return c.description;
  },
  content: (c) => {
    return c.id;
  },
  plugin: (c) => {
    return c.name;
  },
  asset: (c) => {
    return c.correlationCode;
  },
  group: (c) => {
    return c.name;
  },
  category: (c) => {
    return c.code;
  },
  resource: (c) => {
    return c.path;
  },
  label: (c) => {
    return c.key;
  },
  language: (c) => {
    return c.code;
  },
};

const componentResponseProcessor = {
  page: async (response, token) => {
    let pages = response.data.payload;

    //extract homepage
    const res_homepage = await axios.get(apiUrlTable.pageDetails.replace('{code}', 'homepage'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    pages.unshift(res_homepage.data.payload); //Add to beginning of array

    // extract pages configurations
    pages = await Promise.all(pages.map(async (page) => {
      const res = await axios.get(apiUrlTable.pageConfiguration.replace('{code}', page.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const processedWidgets = [];
      const widgets = res.data.payload;
      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        if (widget !== null) {
          widget.pos = i;
          processedWidgets.push(widget);
        }
      }

      page.widgets = processedWidgets;
      return page;
    }));

    //sort by parent/child
    function sortPagesByParent(root, list) {
      const children = list.filter(i => i.parentCode === root.code);
      let result = [root];

      if (children.length > 0) {
        result = result.concat(children.map(c => sortPagesByParent(c, list)).flat());
      }

      return result;
    }

    const root = pages.shift();
    pages = sortPagesByParent(root, pages);

    const schema = {
      'code': 'code',
      'parentCode': 'parentCode',
      'titles': 'titles',
      'pageModel': 'pageModel',
      'ownerGroup': 'ownerGroup',
      'joinGroups': 'joinGroups',
      'displayedInMenu': 'displayedInMenu',
      'seo': 'seo',
      'charset': 'charset',
      'status': 'status',
      'widgets': 'widgets',
    };

    return pages.map(p => objectMapper(p, schema));
  },
  pageModel: async (response, token) => {
    const pageModels = response.data.payload;
    const schema = {
      'code': 'code',
      'descr': 'description',
      'titles': 'titles',
      'configuration.frames[].pos': 'configuration.frames[].pos',
      'configuration.frames[].descr': 'configuration.frames[].description',
      'configuration.frames[].mainFrame': 'configuration.frames[].mainFrame',
      'configuration.frames[].defaultWidget': 'configuration.frames[].defaultWidget',
      'configuration.frames[].sketch': 'configuration.frames[].sketch',
      'template': 'template'
    };

    return pageModels.filter(p => p.configuration && p.configuration.frames.length > 0).map(p => objectMapper(p, schema));
  },
  fragment: async (response, token) => {
    const fragments = await Promise.all(response.data.payload.map(async (fragment) => {
      const res = await axios.get(apiUrlTable.fragmentDetails.replace('{code}', fragment.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      fragment.guiCode = res.data.payload.guiCode || res.data.payload.defaultGuiCode;
      return fragment;
    }));

    const schema = {
      code: [{
        key: 'code',
        transform: function(code) { return code.trim().toLowerCase().replace(new RegExp('[\\s\\-_]+', 'g'), '_') }
      }],
      guiCode: 'guiCode',
    };

    return fragments.map(f => objectMapper(f, schema));
  },
  widget: async (response, token) => {
    const widgets = await Promise.all(response.data.payload.map(async (widget) => {
      const res = await axios.get(apiUrlTable.widgetDetails.replace('{code}', widget.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const guiFragments = res.data.payload.guiFragments;
      if (guiFragments && guiFragments.length > 0) {
        const fragment = guiFragments[0];
        widget.customUi = fragment.customUi !== undefined ? fragment.customUi : fragment.defaultUi;
      }

      return widget;
    }));

    const schema = {
      code: [{
        key: 'code',
        transform: function(code) { return code.trim().toLowerCase().replace(new RegExp('[\\s\\-_]+', 'g'), '_') }
      }],
      'titles': 'titles',
      'group': 'group',
      'customUi': 'customUi',
      'configUi': 'configUi',
    };

    return widgets.filter(w => !w.locked && w.group).map(w => objectMapper(w, schema));
  },
  contentType: async (response, token) => {
    const contentTypes = await Promise.all(response.data.payload.map(async (contentType) => {
      const res = await axios.get(apiUrlTable.contentTypeDetails.replace('{code}', contentType.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const schema = {
        'code': 'code',
        'type': 'type',
        'names': 'names',
        'roles': 'roles',
        'disablingCodes': 'disablingCodes',
        'mandatory': 'mandatory',
        'listFilter': 'listFilter',
        'indexable': 'indexable',
        'enumeratorExtractorBean': 'enumeratorExtractorBean',
        'enumeratorStaticItems': 'enumeratorStaticItems',
        'enumeratorStaticItemsSeparator': 'enumeratorStaticItemsSeparator',
        'validationRules': 'validationRules',
        'nestedAttribute': 'nestedAttribute',
        'compositeAttributes': 'compositeAttributes',
      };

      contentType.attributes = res.data.payload.attributes.map(a => objectMapper(a, schema));

      return contentType;
    }));

    return contentTypes;
  },
  contentModel: async (response, token) => {
    const contentModels = response.data.payload;
    const schema = {
      'id': 'id',
      'contentType': 'contentType',
      'descr': 'description',
      'contentShape': 'contentShape',
    };

    return contentModels.map(c => objectMapper(c, schema));
  },
  content: async (response, token) => {
    const contents = response.data.payload;
    const schema = {
      'id': 'id',
      'typeCode': 'typeCode',
      'description': 'description',
      'mainGroup': 'mainGroup',
      'groups': 'groups',
      'status': 'status',
      'viewPage': 'viewPage',
      'listModel': 'listModel',
      'defaultModel': 'defaultModel',
      'attributes': [{
        key: 'attributes',
        transform: function(attributes) {
          return attributes.map(attr => processContentAttribute(attr));
        }
      }]
    };

    return contents.map(c => objectMapper(c, schema));
  },
  asset: async (response, token) => {
    const assets = response.data.payload;
    const schema = {
      'id': [{
        key: 'correlationCode',
        transform: function(id, source) {
          return source.correlationCode !== null ? source.correlationCode : id;
        }
      }],
      'type': 'type',
      'name': 'name',
      'description': 'description',
      'group': 'group',
      'categories': 'categories',
      'versions': [{
        key: 'path',
        transform: function(versions) {
          if (versions === null) return null;
          return versions.find(v => v.dimensions === null).path;
        }
      }]
    };

    return assets.map(a => objectMapper(a, schema)).filter(a => a.path !== undefined);
  },
  plugin: async (response, token) => {
    const plugins = response.data._embedded &&
      response.data._embedded.entandoPlugins ||
      [];

    const schema = {
      'metadata.name': 'name',
      'spec.image': 'image',
      'spec.dbms': 'dbms',
      'spec.healthCheckPath': 'healthCheckPath',
      'spec.ingressPath': 'ingressPath',
      'spec.roles[].code': 'roles[]',
      'spec.permissions': 'permissions',
    };

    return plugins.map(p => objectMapper(p, schema));
  },
  group: async (response, token) => {
    return response.data.payload;
  },
  category: async (response, token) => {
    const categories = response.data.payload;
    const schema = {
      code: 'code',
      parentCode: 'parentCode',
      titles: 'titles',
    };

    return categories.map(c => objectMapper(c, schema));
  },
  resource: async (response, token) => {
    console.log('Starting File Browser traversion...');
    const files = await recursiveTraverseFileTree(response.data.payload, token);
    return files;
  },
  label: async (response, token) => {
    return response.data.payload;
  },
  language: async (response, token) => {
    const languages = response.data.payload.filter(l => l.isActive);
    const schema = {
      code: 'code',
      description: 'description'
    };

    return languages.map(c => objectMapper(c, schema));
  },
};

const resourceTagRegex = new RegExp('"<@wp.resourceURL[\\n\\t\\r\\s]*/>([^"]+)"', 'g');
const imageTagRegex = new RegExp('"<@wp.imgURL[\\n\\t\\r\\s]*/>([^"]+)"', 'g');
const resourceExtractorByType = {
  page: async (components) => {
    return [];
  },
  pageModel: async (components) => {
    console.log("Extracting used resources by pageModels");
    const resources = await Promise.all(components.map(async (pageModel) => {
      const resources = [];
      if (pageModel.hasOwnProperty('template') && pageModel.template !== null) {
        while (found = resourceTagRegex.exec(pageModel.template)) {
          resources.push(found[1]);
        }

        while (found = imageTagRegex.exec(pageModel.template)) {
          resources.push("static/img/" + found[1]);
        }
      }

      return resources;
    }));

    return resources.flat();
  },
  fragment: async (components) => {
    console.log("Extracting used resources by fragments");
    const resources = await Promise.all(components.map(async (fragment) => {
      const resources = [];
      if (fragment.hasOwnProperty('guiCode') && fragment.guiCode !== null) {
        while (found = resourceTagRegex.exec(fragment.guiCode)) {
          resources.push(found[1]);
        }

        while (found = imageTagRegex.exec(fragment.guiCode)) {
          resources.push("static/img/" + found[1]);
        }
      }

      return resources;
    }));

    return resources.flat();
  },
  widget: async (components) => {
    console.log("Extracting used resources by widgets");
    const resources = await Promise.all(components.map(async (widget) => {
      const resources = [];
      if (widget.hasOwnProperty('configUi') && widget.configUi !== null && widget.configUi.hasOwnProperty('resources')) {
        resources.push.apply(resources, widget.configUi.resources);
      }

      if (widget.hasOwnProperty('customUi') && widget.customUi !== null) {
        while (found = resourceTagRegex.exec(widget.customUi)) {
          resources.push(found[1]);
        }

        while (found = imageTagRegex.exec(widget.customUi)) {
          resources.push("static/img/" + found[1]);
        }
      }

      return resources;
    }));

    return resources.flat();
  },
  contentType: async (response, token) => {
    return [];
  },
  contentModel: async (response, token) => {
    return [];
  },
  content: async (response, token) => {
    return [];
  },
  asset: async (response, token) => {
    return [];
  },
  plugin: async (response, token) => {
    return [];
  },
  group: async (response, token) => {
    return [];
  },
  category: async (response, token) => {
    return [];
  },
  resource: async (response, token) => {
    return [];
  },
  label: async (response, token) => {
    return [];
  },
  language: async (response, token) => {
    return [];
  },
};

const processContentTypeAttribute = function(attribute) {
  const resourceSchema = {
    'id': [{
      key: 'correlationCode',
      transform: function(id, source) {
        return source.correlationCode !== undefined ? source.correlationCode : id;
      }
    }],
    'name': 'name',
    'metadata': 'metadata',
  }

  // process image/file attribute type
  if (attribute.hasOwnProperty('values') && attribute.values !== null) {
    for(var language in attribute.values) {
      const value = attribute.values[language];
      if (value.hasOwnProperty('type') && (value.type === 'image' || value.type === 'file')) {
        attribute.values[language] = objectMapper(value, resourceSchema);
      }
    }
  }

  // recursively process atrributes
  if (attribute.hasOwnProperty('compositeelements') && attribute.compositeelements !== null) {
    attribute.compositeelements = attribute.compositeelements.map(a => processContentAttribute(a));
  }

  if (attribute.hasOwnProperty('elements') && attribute.elements !== null) {
    attribute.elements = attribute.elements.map(a => processContentAttribute(a));
  }

  return attribute;
}


const processContentAttribute = function(attribute) {
  const resourceSchema = {
    'id': [{
      key: 'correlationCode',
      transform: function(id, source) {
        return source.correlationCode !== null ? source.correlationCode : id;
      }
    }],
    'name': 'name',
    'metadata': 'metadata',
  }

  // process image/file attribute type
  if (attribute.hasOwnProperty('values') && attribute.values !== null) {
    for(var language in attribute.values) {
      const value = attribute.values[language];
      if (value.hasOwnProperty('type') && (value.type === 'image' || value.type === 'file')) {
        attribute.values[language] = objectMapper(value, resourceSchema);
      }
    }
  }

  // recursively process atrributes
  if (attribute.hasOwnProperty('compositeelements') && attribute.compositeelements !== null) {
    attribute.compositeelements = attribute.compositeelements.map(a => processContentAttribute(a));
  }

  if (attribute.hasOwnProperty('elements') && attribute.elements !== null) {
    attribute.elements = attribute.elements.map(a => processContentAttribute(a));
  }

  return attribute;
}

const defaultComponentDescriptorProcessor = function(type, location, code, components) {
  const typePlural = typeToPlural(type);
  const codeExtractor = componentCodeExtractors[type];

  return components.map(component => {
      const code = canonizeCode(codeExtractor(component));
      console.log(`Processing ${type}: ${code}`);

      const descriptorName = `${typePlural}/${code}-descriptor.yaml`;
      fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(component, { lineWidth: 1000000 }));

      return descriptorName;
    });
}

const assetComponentDescriptorProcessor = function(type, location, code, components) {
  const typePlural = typeToPlural(type);
  const codeExtractor = componentCodeExtractors[type];

  return Promise.all(components.map(async (component) => {
      const code = canonizeCode(codeExtractor(component));
      console.log(`Processing ${type}: ${code}`);

      const split = coreBaseApi.replace('//', '/').split('/');
      const url = split[0] + '//' + split[1] + component.path;
      const directory = `${location}/${typePlural}/${code}`;

      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }

      const file = await axios.get(url, {
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(`${directory}/${component.name}`);
      await file.data.pipe(writer);

      delete component.path;

      const descriptorName = `${typePlural}/${code}/${code}-descriptor.yaml`;
      fs.promises.writeFile( `${location}/${descriptorName}`, yaml.safeDump(component, { lineWidth: 1000000 }));

      return descriptorName;
    }));
}

const groupIntoSingleComponentDescriptorProcessor = function(type, location, code, components) {
  const typePlural = typeToPlural(type);
  console.log(`Processing ${typePlural}`);
  const descriptorName = `${typePlural}/${typePlural}-descriptor.yaml`;
  fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(components, { lineWidth: 1000000 }));

  return [descriptorName];
}

const resourceUrlFtlRegex = new RegExp('("<@wp.resourceURL[\\n\\t\\r\\s]*/>)([^"]+")', 'g');
const imgUrlFtlRegex = new RegExp('("<@wp.)imgURL([\\n\\t\\r\\s]*/>)([^"]+")', 'g');

const componentDescriptorProcessors = {
  page: (type, location, code, components) => {
    return defaultComponentDescriptorProcessor(type, location, code, components);
  },
  pageModel: (type, location, code, components) => {
    const processedComponents = components.map(pageModel => {
      if (pageModel.hasOwnProperty('template') && pageModel.template !== null) {
        pageModel.template = pageModel.template.replace(resourceUrlFtlRegex, `$1${code}/$2`);
        pageModel.template = pageModel.template.replace(imgUrlFtlRegex, `$1resourceURL$2${code}/static/img/$3`);
      }

      return pageModel;
    });

    return defaultComponentDescriptorProcessor(type, location, code, processedComponents);
  },
  fragment: (type, location, code, components) => {
    const processedComponents = components.map(fragment => {
      if (fragment.hasOwnProperty('guiCode') && fragment.guiCode !== null) {
        fragment.guiCode = fragment.guiCode.replace(resourceUrlFtlRegex, `$1${code}/$2`)
        fragment.guiCode = fragment.guiCode.replace(imgUrlFtlRegex, `$1resourceURL$2${code}/static/img/$3`);
      }

      return fragment;
    });

    return defaultComponentDescriptorProcessor(type, location, code, processedComponents);
  },
  widget: (type, location, code, components) => {
    const processedComponents = components.map(widget => {
      if (widget.hasOwnProperty('configUi') && widget.configUi !== null && widget.configUi.hasOwnProperty('resources')) {
        console.log("Replacing widget resources links...");
        widget.configUi.resources = widget.configUi.resources.map(path => `${code}/${path}`);
      }

      if (widget.hasOwnProperty('customUi') && widget.customUi !== null) {
        widget.customUi = widget.customUi.replace(resourceUrlFtlRegex, `$1${code}/$2`)
        widget.customUi = widget.customUi.replace(imgUrlFtlRegex, `$1resourceURL$2${code}/static/img/$3`);
      }

      return widget;
    });

    return defaultComponentDescriptorProcessor(type, location, code, processedComponents);
  },
  contentType: (type, location, code, components) => {
    return defaultComponentDescriptorProcessor(type, location, code, components);
  },
  contentModel: (type, location, code, components) => {
    return defaultComponentDescriptorProcessor(type, location, code, components);
  },
  content: (type, location, code, components) => {
    return defaultComponentDescriptorProcessor(type, location, code, components);
  },
  asset: (type, location, code, components) => {
    return assetComponentDescriptorProcessor(type, location, code, components);
  },
  plugin: (type, location, code, components) => {
    return defaultComponentDescriptorProcessor(type, location, code, components);
  },
  group: (type, location, code, components) => {
    return groupIntoSingleComponentDescriptorProcessor(type, location, code, components);
  },
  category: (type, location, code, components) => {
    return groupIntoSingleComponentDescriptorProcessor(type, location, code, components);
  },
  label: (type, location, code, components) => {
    return groupIntoSingleComponentDescriptorProcessor(type, location, code, components);
  },
  language: (type, location, code, components) => {
    return groupIntoSingleComponentDescriptorProcessor(type, location, code, components);
  },
};

function canonizeCode (code) {
  return code.trim().toLowerCase().replace(new RegExp(' ', 'g'), '-').replace(new RegExp('-+', 'g'), '-');
}

const urlEncoder = function (payload) {
  return Object.keys(payload)
    .map((k) => `${k}=${payload[k]}`)
    .reduce((a, v, i) => (i === 0 ? v : `${a}&${v}`), '');
};

const getToken = async function () {
  const keycloakResponse = await axios.get(coreBaseApi + '/keycloak.json');
  const tokenUrl = keycloakResponse.data['auth-server-url'] + '/realms/entando/protocol/openid-connect/token';

  const payload = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const res = await axios.post(tokenUrl, urlEncoder(payload), headers);
  return res.data.access_token;
};

async function getComponents (type) {
  // Check if exists in cache
  if (hasProperty(componentCache, type)) {
    return componentCache[type];
  }

  const token = await getToken();
  const response = await axios.get(apiUrlTable[type], {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Process response and extract any aditional details
  const components = await componentResponseProcessor[type](response, token);

  // Add to cache
  componentCache[type] = components;

  return components;
};

async function recursiveTraverseFileTree(root, token) {
  const rootTraversed = await Promise.all(root.map(async (resource) => {
    if (resource.directory === true) {
      const result = await axios.get(apiUrlTable.resource.replace('currentPath=', `currentPath=${resource.path}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const traversed = await recursiveTraverseFileTree(result.data.payload, token);
      return traversed.flat();
    } else {
      console.log('Collecting File: ' + resource.path);
      const response = await axios.get(apiUrlTable.resourceDetails.replace('{path}', resource.path), {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.payload;
    }
  }));

  return rootTraversed.flat();
};

async function collectAllComponents () {
  const allComponents = {};

  await Promise.all(ALL_TYPES.map(async (type) => {
    console.log(`Collecting ${typeToPlural(type)}`);
    const cmp = await getComponents(type);
    if (cmp) {
      const dtls = componentDetailExtractors[type](cmp);
      if (dtls) {
        allComponents[type] = dtls.map(d => d.value);
      }
    }
    console.log(`Finished collecting ${typeToPlural(type)}`);
  }));

  return allComponents;
};

const typeToPlural = function (type) {
  return type.endsWith('y') ? type.slice(0, -1) + 'ies' : type + 's';
};

const hasProperty = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const environmentQuestions = [
  {
    type: 'input',
    name: 'env',
    message: 'Please select an env.json file with the environment variables:',
    default: 'env.json',
  },
];

const collectQuestions = [
  {
    type: 'list',
    name: 'componentType',
    message: 'Which type of components do you want to add to the bundle?',
    choices: [
      { name: 'All components', value: 'all' },
      { name: 'Pages', value: 'page' },
      { name: 'Page templates', value: 'pageModel' },
      { name: 'UX Fragments', value: 'fragment' },
      { name: 'Microfrontends / Widgets', value: 'widget' },
      { name: 'Microservices', value: 'plugin' },
      { name: 'Content Templates', value: 'contentModel' },
      { name: 'Content Types', value: 'contentType' },
      { name: 'Contents', value: 'content' },
      { name: 'CMS Assets', value: 'asset' },
      { name: 'Groups', value: 'group' },
      { name: 'Categories', value: 'category' },
      { name: 'Labels', value: 'label' },
    ],
  },
  {
    when: (answers) => answers.componentType !== 'all',
    type: 'checkbox',
    name: 'components',
    message: 'Which components do you want to include in the bundle?',
    choices: async (answers) => {
      const type = answers.componentType;
      const components = await getComponents(type);
      return componentDetailExtractors[type](components);
    },
    default: async (answers) => {
      if (hasProperty(allAnswers, answers.componentType)) {
        return Array.from(allAnswers[answers.componentType]);
      }
      return {};
    },
  },
  {
    type: 'confirm',
    name: 'addMoreComponents',
    message: 'Do you want to add more components to the Bundle?',
    default: true,
    when: (answers) => answers.componentType !== 'all',
  },
];

const generateQuestions = [
  {
    type: 'confirm',
    name: 'generateBundle',
    message: 'Do you want to generate the Bundle with the selected components?',
    default: true,
  },
  {
    type: 'input',
    name: 'location',
    message: 'Where do you want to generate the Bundle?',
    default: './',
  },
  {
    type: 'input',
    name: 'code',
    message: "What's the code for the Bundle?",
    validate: (code) => code !== undefined && code.length > 0,
  },
  {
    type: 'input',
    name: 'description',
    message: 'Please add a description to the Bundle:',
  },
];

async function generateBundle (options, components) {
  console.log('Generating bundle...');

  const { code, description, location } = options;
  const path = location.charAt(location.length - 1) === '/' ? location.slice(0, -1) : location;

  // Filter widget fragments
  const filteredComponents = await filterWidgetFragments(components);

  // Extract used resources
  const resources = await Promise.all(ALL_TYPES.map(async (type) => {
    if (filteredComponents[type] === undefined) return [];

    const idExtractor = componentIdExtractors[type];
    const codeExtractor = componentCodeExtractors[type];
    const cachedComponents = filteredComponents[type].map(c => componentCache[type].find(cached => idExtractor(cached) === c));

    return resourceExtractorByType[type](cachedComponents);
  }));

  // Filter unique resources and save into resources folder
  const uniqueUsedFiles = resources.flat().filter(onlyUnique);
  await saveResources(path, uniqueUsedFiles);

  // Save components descriptors by type
  const results = await Promise.all(ALL_TYPES.map(async (type) => {
    const descriptors = await saveComponentsDescriptor(type, path, code, filteredComponents[type]);
    return descriptors;
  }));

  const descriptors = {};
  results.filter(v => v !== undefined).forEach(value => {
    descriptors[value.type] = value.descriptors;
  });

  // Save bundle descriptor
  await saveBundleDescriptor(code, description, path, descriptors);
}

async function filterWidgetFragments(components) {
  const widgets = components['widget'];
  components['fragment'] = components['fragment'].filter(f => !widgets.includes(f));
  return components;
}

async function saveComponentsDescriptor(type, location, bundle_code, componentIds) {
  if (undefined === componentIds) return;

  const typePlural = typeToPlural(type);
  const idExtractor = componentIdExtractors[type];
  const codeExtractor = componentCodeExtractors[type];
  const descriptorProcessor = componentDescriptorProcessors[type];

  const components = componentIds.map(c => componentCache[type].find(cached => idExtractor(cached) === c));

  console.log(`Creating directory: ${location}/${typePlural}`);
  await fs.promises.mkdir(`${location}/${typePlural}`, { recursive: true });

  const descriptors = await descriptorProcessor(type, location, bundle_code, components);

  return { type: `${typePlural}`, descriptors: descriptors };
}

async function saveResources(location, resourcesPaths) {
  // Force fetch resources into cache
  await getComponents('resource');

  const components = resourcesPaths.map(r => componentCache['resource'].find(c => c.path === r)).filter(x => !(!x));

  components.forEach(resource => {
    console.log(`Processing resource: ${resource.path}`);
    writeFileSyncRecursive(`${location}/resources/${resource.path}`, resource.base64);
  });
}

async function saveBundleDescriptor (code, description, location, components) {
  const bundle = {
    code: code,
    description: description,
    components: components,
  };

  console.log(`Saving bundle descriptor at ${location}/descriptor.yaml`);

  return fs.promises.writeFile(`${location}/descriptor.yaml`, yaml.safeDump(bundle, { lineWidth: 1000000 }));
}

function writeFileSyncRecursive (filename, content) {
  const folders = filename.split(path.posix.sep).slice(0, -1);
  if (folders.length) {
    // create folder path if it doesn't exist
    folders.reduce((last, folder) => {
      const folderPath = last ? last + path.posix.sep + folder : folder;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath;
    });
  }
  fs.writeFileSync(filename, content, 'base64');
}

async function inquireComponents () {
  var answers;
  do {
    answers = await inquirer.prompt(collectQuestions);
    const type = answers.componentType;
    var components;

    if (type === 'all') {
      console.log('Collecting all components from the provided environment...');
      components = await collectAllComponents();

      for (const type of ALL_TYPES) {
        allAnswers[type] = components[type];
      }
    } else {
      components = answers.components;
      allAnswers[type] = components;
    }
  } while (answers.componentType !== 'all' && answers.addMoreComponents);
}

async function checkFileExists (file) {
  return fs.promises.access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

async function setupEnvironment (options) {
  const exists = await checkFileExists(options.env);
  if (!exists) {
    throw new Error(`File not found: ${options.env}`);
  }

  const envContent = JSON.parse(fs.readFileSync(options.env));

  // Setup env variables
  coreBaseApi = envContent.coreBaseApi;
  k8ssvcApi = envContent.k8ssvcApi;
  clientId = envContent.clientId;
  clientSecret = envContent.clientSecret;

  // Init Url table with env variables
  apiUrlTable = {
    widget: `${coreBaseApi}/api/widgets`,
    widgetDetails: `${coreBaseApi}/api/widgets/{code}`,
    pageModel: `${coreBaseApi}/api/pageModels`,
    fragment: `${coreBaseApi}/api/fragments`,
    fragmentDetails: `${coreBaseApi}/api/fragments/{code}`,
    page: `${coreBaseApi}/api/pages?status=published`,
    pageDetails: `${coreBaseApi}/api/pages/{code}`,
    pageConfiguration: `${coreBaseApi}/api/pages/{code}/widgets`,
    group: `${coreBaseApi}/api/groups`,
    label: `${coreBaseApi}/api/labels`,
    language: `${coreBaseApi}/api/languages`,
    category: `${coreBaseApi}/api/categories`,
    contentType: `${coreBaseApi}/api/plugins/cms/contentTypes`,
    contentTypeDetails: `${coreBaseApi}/api/plugins/cms/contentTypes/{code}`,
    contentModel: `${coreBaseApi}/api/plugins/cms/contentmodels`,
    content: `${coreBaseApi}/api/plugins/cms/contents`,
    asset: `${coreBaseApi}/api/plugins/cms/assets`,
    plugin: `${k8ssvcApi}/plugins`,
    resource: `${coreBaseApi}/api/fileBrowser?protectedFolder=false&currentPath=`,
    resourceDetails: `${coreBaseApi}/api/fileBrowser/file?protectedFolder=false&currentPath={path}`,
  };
}

async function interactiveSession () {
  const envAnswer = await inquirer.prompt(environmentQuestions);
  await setupEnvironment(envAnswer);

  let confirmation;
  do {
    await inquireComponents();
    confirmation = await inquirer.prompt(generateQuestions);
  } while (!confirmation.generateBundle);

  await generateBundle(confirmation, allAnswers);
}

module.exports = {
  interactiveSession,
  setupEnvironment,
  collectAllComponents,
  generateBundle,
};


function onlyUnique (value, index, self) {
  return self.indexOf(value) === index;
}
