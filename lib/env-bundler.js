const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const objectMapper = require('object-mapper');

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
      'plugin',
      'category',
    ];

let apiUrlTable = {};

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
    }),
  category: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.titles.en} (${c.code})` };
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
      return c.metadata.name;
  },
  resource: (c) => {
      return c.id;
  },
  group: (c) => {
      return c.code;
  },
  category: (c) => {
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
  },
  category: (c) => {
      return c.code;
  }
};

const componentResultMappers = {
  category: {
      'code': 'code',
      'parentCode': 'parentCode',
      'titles': 'titles'
  }
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
  let components;
  // TODO this selection based on type is not ideal
  if (type === 'plugin') {
    components = res.data._embedded.entandoPlugins;
  } else {
    components = res.data.payload;
  }

  if (type == 'page') {
    await Promise.all(components.map(async (page) => {
      const res = await axios.get(apiUrlTable['pageConfiguration'].replace('{code}', page.code), {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      page.configuration = res.data.payload;
    }));
  }

  const mapper = componentResultMappers[type];
  if (mapper !== undefined) {
    components = components.map(c => objectMapper(c, mapper))
  }

  //Add to cache
  componentCache[type] = components;

  return components;
};

async function collectAllComponents() {
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
}

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
      { name: 'Categories', value: 'category' },
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

async function saveComponentsDescriptor(type, location, component_ids) {
  if (type == 'resource') return; //TODO not yet supported
  if (undefined === component_ids) return;

  const typePlural = typeToPlural(type);
  let idExtractor = componentIdExtractors[type];
  let codeExtractor = componentCodeExtractors[type];

  let components = component_ids.map(c => componentCache[type].find(cached => idExtractor(cached) == c));

  console.log(`Creating directory: ${location}/${typePlural}`);
  await fs.promises.mkdir(`${location}/${typePlural}`, { recursive: true });

  
  let descriptors;
  if (type == 'group' || type == 'category') { //Should group in a single descriptor
    console.log(`Processing ${typePlural}`);
    const descriptorName = `${typePlural}/${typePlural}-descriptor.yaml`;
    fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(components));

    descriptors = [descriptorName];
  } else {
    descriptors = components.map(component => {
      let code = canonizeCode(codeExtractor(component));
      console.log(`Processing ${type}: ${code}`);
      
      const descriptorName = `${typePlural}/${code}-descriptor.yaml`;
      fs.promises.writeFile(`${location}/${descriptorName}`, yaml.safeDump(component));

      return descriptorName;
    });
  }

  return { type: `${typePlural}`, descriptors: descriptors };
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
    var components;

    if (type === 'all') {
      console.log('Collecting all components from the provided environment...');
      components = await collectAllComponents();

      ALL_TYPES.forEach(type => allAnswers[type] = components[type]);
    } else {
      components = answers.components;
      allAnswers[type] = components;
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
    pageConfiguration: `${coreBaseApi}/api/pages/{code}/configuration`,
    page: `${coreBaseApi}/api/pages?status=published`,
    group: `${coreBaseApi}/api/groups`,
    category: `${coreBaseApi}/api/categories`,
    contentType: `${coreBaseApi}/api/plugins/cms/contentTypes`,
    contentModel: `${coreBaseApi}/api/plugins/cms/contentmodels`,
    resource: `${coreBaseApi}/api/plugins/cms/assets`,
    plugin: `${k8ssvcApi}/plugins`,
  };
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
