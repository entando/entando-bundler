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
  'plugin',
  'category',
  'resource',
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
      return { value: c.code, name: `${c.descr} (${c.code})` };
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
      return { value: c.id, name: `${c.descr} (${c.id})` };
    }),
  plugin: (components) =>
    components.map((c) => {
      return { value: c.name, name: `${c.image} (${c.name})` };
    }),
  /* cms_asset: (components) =>
    components.map((c) => {
      let path;
      if (c.type === 'file') {
        path = c.path;
      } else {
        path = c.versions.find(v => v.dimensions == null).path;
      }

      return { value: c.id, name: `(${c.type}) ${path}` };
    }), */
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
  plugin: (c) => {
    return c.name;
  },
  /* cms_asset: (c) => {
      return c.id;
  }, */
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
    return c.descr;
  },
  plugin: (c) => {
    return c.name;
  },
  /* cms_asset: (c) => {
      return c.name;
  }, */
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
    const pages = await Promise.all(response.data.payload.map(async (page) => {
      const res = await axios.get(apiUrlTable.pageConfiguration.replace('{code}', page.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      page.configuration = res.data.payload;
      return page;
    }));

    return pages;
  },
  pageModel: async (response, token) => {
    return response.data.payload;
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
      code: 'code',
      guiCode: 'guiCode',
    };

    return fragments.map(f => objectMapper(f, schema));
  },
  widget: async (response, token) => {
    return response.data.payload;
  },
  contentType: async (response, token) => {
    const contentTypes = await Promise.all(response.data.payload.map(async (contentType) => {
      const res = await axios.get(apiUrlTable.contentTypeDetails.replace('{code}', contentType.code), {
        headers: { Authorization: `Bearer ${token}` },
      });

      contentType.attributes = res.data.payload.attributes;
      return contentType;
    }));

    return contentTypes;
  },
  contentModel: async (response, token) => {
    return response.data.payload;
  },
  plugin: async (response, token) => {
    const plugins = response.data._embedded.entandoPlugins;
    const schema = {
      'metadata.name': 'name',
      'spec.image': 'image',
      'spec.dbms': 'dbms',
      'spec.healthCheckPath': 'healthCheckPath',
      'spec.healthCheckPath': 'healthCheckPath',
      'spec.roles[].code': 'roles[]',
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

async function recursiveTraverseFileTree (root, token) {
  const rootTraversed = await Promise.all(root.map(async (resource) => {
    if (resource.directory === true) {
      const result = await axios.get(apiUrlTable.resource.replace('currentPath=', `currentPath=${resource.path}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const traversed = await recursiveTraverseFileTree(result.data.payload, token);
      return traversed.flat();
    } else {
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
    const dtls = componentDetailExtractors[type](cmp);
    allComponents[type] = dtls.map(d => d.value);
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
      { name: 'Groups', value: 'group' },
      { name: 'Categories', value: 'category' },
      { name: 'Labels', value: 'label' },
      { name: 'File Browser', value: 'resource' },
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

  const results = await Promise.all(ALL_TYPES.map(async (type) => {
    return saveComponentsDescriptor(type, path, components[type]);
  }));

  const descriptors = {};
  results.filter(v => v !== undefined && v.type !== 'resources').forEach(value => {
    descriptors[value.type] = value.descriptors;
  });

  await saveBundleDescriptor(code, description, path, descriptors);
}

async function saveComponentsDescriptor (type, location, componentIds) {
  if (undefined === componentIds) return;

  const typePlural = typeToPlural(type);
  const idExtractor = componentIdExtractors[type];
  const codeExtractor = componentCodeExtractors[type];

  const components = componentIds.map(c => componentCache[type].find(cached => idExtractor(cached) === c));

  console.log(`Creating directory: ${location}/${typePlural}`);
  await fs.promises.mkdir(`${location}/${typePlural}`, { recursive: true });

  let descriptors = [];
  if (type === 'group' || type === 'category' || type === 'label' || type === 'language') { // Should group in a single descriptor
    console.log(`Processing ${typePlural}`);
    const descriptorName = `${typePlural}/${typePlural}-descriptor.yaml`;
    fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(components));

    descriptors = [descriptorName];
  } else if (type === 'resource') { // Resources are exported on a resource folder instead of descriptors
    components.forEach(file => {
      console.log(`Processing ${type}: ${file.path}`);
      writeFileSyncRecursive(`${typePlural}/${file.path}`, file.base64);
    });
  } else {
    descriptors = components.map(component => {
      const code = canonizeCode(codeExtractor(component));
      console.log(`Processing ${type}: ${code}`);

      const descriptorName = `${typePlural}/${code}-descriptor.yaml`;
      fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(component));

      return descriptorName;
    });
  }

  return { type: `${typePlural}`, descriptors: descriptors };
}

async function saveBundleDescriptor (code, description, location, components) {
  const bundle = {
    code: code,
    description: description,
    components: components,
  };

  console.log(`Saving bundle descriptor at ${location}/descriptor.yaml`);

  return fs.promises.writeFile(`${location}/descriptor.yaml`, yaml.safeDump(bundle, { lineWidth: 10000 }));
}

function writeFileSyncRecursive (filename, content) {
  const folders = filename.split(path.sep).slice(0, -1);
  if (folders.length) {
    // create folder path if it doesn't exist
    folders.reduce((last, folder) => {
      const folderPath = last ? last + path.sep + folder : folder;
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
    pageModel: `${coreBaseApi}/api/pageModels`,
    fragment: `${coreBaseApi}/api/fragments`,
    fragmentDetails: `${coreBaseApi}/api/fragments/{code}`,
    pageConfiguration: `${coreBaseApi}/api/pages/{code}/configuration`,
    page: `${coreBaseApi}/api/pages?status=published`,
    group: `${coreBaseApi}/api/groups`,
    label: `${coreBaseApi}/api/labels`,
    language: `${coreBaseApi}/api/languages`,
    category: `${coreBaseApi}/api/categories`,
    contentType: `${coreBaseApi}/api/plugins/cms/contentTypes`,
    contentTypeDetails: `${coreBaseApi}/api/plugins/cms/contentTypes/{code}`,
    contentModel: `${coreBaseApi}/api/plugins/cms/contentmodels`,
    // cms_asset: `${coreBaseApi}/api/plugins/cms/assets`,
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
