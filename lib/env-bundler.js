const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

var allAnswers = {};
var componentCache = {};

let ALL_TYPES = [
      'widget',
      'pageModel',
      'fragment',
      'page',
      'group',
      'contentType',
      'contentModel',
      'resource',
      'plugin'
    ];

let apiUrlTable = {};
let apiCallbackMap = {};
let saveComponentDescriptorFnByType = {};

let coreBaseApi, k8ssvcApi, clientId, clientSecret;

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
      return { value: c.metadata.name, name: `${c.spec.image} (${c.metadata.name})` };
    }),
  resource: (components) =>
    components.map((c) => {
      let path;
      if (c.type === 'file') {
        path = c.path;
      } else {
        path = c.versions.find(v => v.dimensions == null).path;
      }

      return { value: path, name: `(${c.type}) ${path}` };
    }),
  group: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.name} (${c.code})` };
    })
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
      return c.metadata.name;
  },
  resource: (c) => {
      return c.id;
  },
  group: (c) => {
      return c.code;
  }
};

function canonizeCode(code) {
  return code.trim().toLowerCase().replace(new RegExp(' ','g'), '-').replace(new RegExp('[\-]+','g'), '-')
}



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
      return c.metadata.name;
  },
  resource: (c) => {
      return c.name;
  },
  group: (c) => {
      return c.name;
  }
};

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

async function getComponents(type) {
  //Check if exists in cache
  if (hasProperty(componentCache, type)) {
    return componentCache[type];
  }

  const token = await getToken();
  const res = await axios.get(apiUrlTable[type], {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let components = [];
  // TODO this selection based on type is not ideal
  if (type === 'plugin') {
    components = res.data._embedded.entandoPlugins;
  } else {
    components = res.data.payload;
  }

  await execApiCallbackFn(type, components, token);

  // Add to cache
  componentCache[type] = components;

  return components;
};

async function collectAllComponents() {
  const allComponents = {};

  await Promise.all(ALL_TYPES.map(async (type) => {
      console.log(`Collecting ${type}s`);
      const cmp = await getComponents(type);
      const dtls = componentDetailExtractors[type](cmp);
      allComponents[type] = dtls.map(d => d.value);
    }));

  return allComponents;
};

const hasProperty = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const environmentQuestions = [
  {
    type: 'input',
    name: 'env',
    message: 'Please select an env.json file with the environment variables:',
    default: 'env.json'
  }
]

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
      { name: 'Resources', value: 'resource' },
      { name: 'Groups', value: 'group' },
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
      return componentDetailExtractors[type](componentCache[type]);
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
    when: (answers) => answers.componentType !== 'all'
  }
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
    default: './'
  },
  {
    type: 'input',
    name: 'code',
    message: "What's the code for the Bundle?",
    validate: (code) => code !== undefined && code.length > 0
  },
  {
    type: 'input',
    name: 'description',
    message: "Please add a description to the Bundle:"
  }
]

async function generateBundle(options, components) {
  console.log('Generating bundle...')

  let promises = [];
  const { code, description, location } = options;

  const path = location.charAt(location.length - 1) === '/' ? location.slice(0, -1) : location;

  let results = await Promise.all(ALL_TYPES.map(async (type) => {
      return saveComponentsDescriptor(type, path, components[type])
    }));

  descriptors = {};
  results.filter(v => v !== undefined).forEach(value => {
    descriptors[value.type] = value.descriptors;
  });

  await saveBundleDescriptor(code, description, path, descriptors);
}

async function saveComponentsDescriptor(type, location, components) {
  if (type == 'resource') return; //TODO not yet supported
  if (undefined === components) return;

  let idExtractor = componentIdExtractors[type];

  let comps = components.map(c => componentCache[type].find(cached => idExtractor(cached) == c));

  console.log(`Creating directory: ${location}/${type}s`);
  await fs.promises.mkdir(`${location}/${type}s`, { recursive: true });

  let descriptors = execSaveComponentDescriptorFnByType(type, location, comps);

  return { type: `${type}s`, descriptors: descriptors };
}

async function saveBundleDescriptor(code, description, location, components) {
  const bundle = {
    code: code,
    description: description,
    components: components
  };

  console.log(`Saving bundle descriptor at ${location}/descriptor.yaml`);

  return fs.promises.writeFile(`${location}/descriptor.yaml`, yaml.safeDump(bundle, { lineWidth: 10000 }));
}

async function inquireComponents() {
  var answers;
  do {
    answers = await inquirer.prompt(collectQuestions);
    const type = answers.componentType;
    var comps;

    if (type === 'all') {
      console.log('Collecting all components from the provided environment...');
      comps = await collectAllComponents();

      ALL_TYPES.forEach(type => allAnswers[type] = comps[type]);
    } else {
      comps = answers.components;
      allAnswers[type] = comps;
    }
    
  } while (answers.componentType !== 'all' && answers.addMoreComponents);
}

async function checkFileExists(file) {
  return fs.promises.access(file, fs.constants.F_OK)
           .then(() => true)
           .catch(() => false)
}

async function setupEnvironment(options) {
  let exists = await checkFileExists(options.env);
  if (!exists) {
    throw new Error(`File not found: ${options.env}`);
  }

  envContent = JSON.parse(fs.readFileSync(options.env));

  //Setup env variables
  coreBaseApi = envContent.coreBaseApi;
  k8ssvcApi = envContent.k8ssvcApi;
  clientId = envContent.clientId;
  clientSecret = envContent.clientSecret;

  //Init Url table with env variables
  apiUrlTable = {
    widget: `${coreBaseApi}/api/widgets`,
    pageModel: `${coreBaseApi}/api/pageModels`,
    fragment: `${coreBaseApi}/api/fragments`,
    fragmentDetails: `${coreBaseApi}/api/fragments/{code}`,
    pageConfiguration: `${coreBaseApi}/api/pages/{code}/configuration`,
    page: `${coreBaseApi}/api/pages?status=published`,
    group: `${coreBaseApi}/api/groups`,
    contentType: `${coreBaseApi}/api/plugins/cms/contentTypes`,
    contentModel: `${coreBaseApi}/api/plugins/cms/contentmodels`,
    resource: `${coreBaseApi}/api/plugins/cms/assets`,
    plugin: `${k8ssvcApi}/plugins`,
  };

  // Init api callbacks
  apiCallbackMap = {

    // pages
    page: async (pageArray, token) => {
      await Promise.all(pageArray.map(async (page) => {
        const res = await axios.get(apiUrlTable['pageConfiguration'].replace('{code}', page.code), {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        page.configuration = res.data.payload;
      }));
    },
    // gets fragments details and manages them
    fragment: async (fragmentArray, token) => {

      await Promise.all(fragmentArray.map(async (fragment) => {
        await axios.get(apiUrlTable.fragmentDetails.replace('{code}', fragment.code), {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }).then(res => fragment.guiCode = res.data.payload.guiCode || res.data.payload.defaultGuiCode );
      }));
    },
    // default
    default: () => {}
  }

  saveComponentDescriptorFnByType = {

    // groups
    'group': (type, location, component) => {

      console.log(`Processing ${type}s`);
      const descriptorName = `${type}s/groups-descriptor.yaml`;
      fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(component));

      return [descriptorName];
    },

    // fragment
    'fragment': (type, location, components) => {

      return components.map(fragment => {

        let code = canonizeCode(componentCodeExtractors[type](fragment));
        console.log(`Processing ${type}: ${code}`);

        fs.promises.mkdir(`${location}/${type}s/guiCodePaths`, { recursive: true });
        writeFragmentGuiPathTemplateFile(type, location, fragment)

        return writeGenericComponentDescriptor(type, location, fragment);
      });
    },
    // default
    'default': (type, location, components) => {

      return components.map(component => {

        let code = canonizeCode(componentCodeExtractors[type](component));
        console.log(`Processing ${type}: ${code}`);

        return writeGenericComponentDescriptor(type, location, code);
      });
    }
  }
}

/**
 *
 * @param type
 * @param components
 * @param token
 * @returns {*}
 */
function execApiCallbackFn(type, components, token) {

  let apiCallback = apiCallbackMap[type];
  if (! apiCallback) {
    apiCallback = apiCallbackMap.default;
  }
  return apiCallback(components, token);
}

/**
 *
 * @param type
 * @param location
 * @param components
 * @returns {*}
 */
function execSaveComponentDescriptorFnByType(type, location, components) {

  let saveCompDescFn = saveComponentDescriptorFnByType[type];
  if (! saveCompDescFn) {
    saveCompDescFn = saveComponentDescriptorFnByType.default;
  }

  return saveCompDescFn(type, location, components);
}

/**
 *
 * @param type
 * @param location
 * @param code
 * @returns {string}
 */
function writeGenericComponentDescriptor(type, location, component) {
  let code = canonizeCode(componentCodeExtractors[type](component));
  const descriptorName = `${type}s/${code}-descriptor.yaml`;
  fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(component));
  return descriptorName;
}

function writeFragmentGuiPathTemplateFile(type, location, fragment) {

  if (fragment && fragment.guiCode && fragment.guiCode.length > 500) {

    let code = canonizeCode(componentCodeExtractors[type](fragment));
    descriptorName = `${type}s/guiCodePaths/${code}-gui-code-template.ftl`;
    fs.promises.writeFile(`${location}/${descriptorName}`, fragment.guiCode);  // TODO check if escape is needed here
    fragment.guiCode = null;
    fragment.guiCodePath = descriptorName;
  }
}


async function main () {
  envAnswer = await inquirer.prompt(environmentQuestions);
  await setupEnvironment(envAnswer);

  let confirmation;
  do {
    await inquireComponents();
    confirmation = await inquirer.prompt(generateQuestions);
  } while (!confirmation.generateBundle);

  await generateBundle(confirmation, allAnswers);
}

module.exports = {
	main,
  setupEnvironment,
  collectAllComponents,
  generateBundle,
};
