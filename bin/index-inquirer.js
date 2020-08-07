const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');

var allAnswers = {};
var componentCache = {};

const envFile = process.argv[2];
const envContent = JSON.parse(fs.readFileSync(envFile));

const { coreBaseApi, k8ssvcApi, clientId, clientSecret } = envContent;

const apiUrlTable = {
  widget: `${coreBaseApi}/api/widgets`,
  pageTemplate: `${coreBaseApi}/api/pageModels`,
  fragment: `${coreBaseApi}/api/fragments`,
  page: `${coreBaseApi}/api/pages?status=published`,
  contentType: `${coreBaseApi}/api/plugins/cms/contentTypes`,
  contentTemplate: `${coreBaseApi}/api/plugins/cms/contentmodels`,
  microservice: `${k8ssvcApi}/plugins`,
};

const componentDetailExtractors = {
  page: (components) =>
    components.map((c) => {
      return { value: c.code, name: `${c.titles.en} (${c.code})` };
    }),
  pageTemplate: (components) =>
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
  contentTemplate: (components) =>
    components.map((c) => {
      return { value: c.id, name: `${c.descr} (${c.id})` };
    }),
  microservice: (components) =>
    components.map((c) => {
      return { value: c.metadata.name, name: `${c.spec.image} (${c.metadata.name})` };
    }),
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

const getComponents = async function (type) {
  const token = await getToken();
  const res = await axios.get(apiUrlTable[type], {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let components = [];
  // TODO this selection based on type is not ideal
  if (type === 'microservice') {
    components = res.data._embedded.entandoPlugins;
  } else {
    components = res.data.payload;
  }
  return components;
};

const collectAllComponents = async function () {
  const allComponents = {};
  for (const ct in apiUrlTable) {
    console.log(`Collecting ${ct}s`);
    const cmp = await getComponents(ct);
    const dtls = componentDetailExtractors[ct](cmp);
    if (!hasProperty(allComponents, ct)) {
      allComponents[ct] = new Set();
    }
    allComponents[ct] = dtls.map(d => d.value);
  }
  return allComponents;
};

const hasProperty = function (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const collectQuestions = [
  {
    type: 'confirm',
    name: 'addComponents',
    message: 'Do you want to add new components to the bundle?',
    default: true,
  },
  {
    when: (answers) => answers.addComponents === true,
    type: 'list',
    name: 'componentType',
    message: 'Which type of components you want to add to the bundle?',
    choices: [
      { name: 'All components', value: 'all' },
      { name: 'Pages', value: 'page' },
      { name: 'Page templates', value: 'pageTemplate' },
      { name: 'UX Fragments', value: 'fragment' },
      { name: 'Microfrontends / Widgets', value: 'widget' },
      { name: 'Microservices', value: 'microservice' },
      { name: 'Content Templates', value: 'contentTemplate' },
      { name: 'Content Types', value: 'contentType' },
    ],
  },
  {
    when: (answers) =>
      answers.addComponents === true && answers.componentType !== 'all',
    type: 'checkbox',
    name: 'components',
    message: 'Which widgets do you want to include in the bundle?',
    choices: async (answers) => {
      const ct = answers.componentType;
      if (!hasProperty(componentCache, ct)) {
        const components = await getComponents(answers.componentType);
        componentCache[ct] = components;
      }
      return componentDetailExtractors[ct](componentCache[ct]);
    },
    default: async (answers) => {
      if (hasProperty(allAnswers, answers.componentType)) {
        return Array.from(allAnswers[answers.componentType]);
      }
      return {};
    },
  },
];

const reviewQuestions = [
  {
    type: 'confirm',
    name: 'reviewComponents',
    message: 'Do you want to review all the selected components for a final check?',
    default: true,
  },
  {
    when: (answers) => answers.reviewComponents === true,
    type: 'checkbox',
    name: 'reviewedComponents',
    message: 'Select the components you want to keep for the bundle?',
    choices: async (answers) => {
      const allChoices = [];
      for (const ct in allAnswers) {
        const cmps = Array.from(allAnswers[ct]);
        allChoices.push(new inquirer.Separator(ct));
        allChoices.push(...cmps.map(v => { return { value: `${ct}|${v}`, name: `${v}` }; }));
      }
      return allChoices;
    },
    default: async (answers) => {
      const allValues = [];
      for (const ct in allAnswers) {
        const cmps = Array.from(allAnswers[ct]);
        allValues.push(...cmps.map(v => `${ct}|${v}`));
      }
      return allValues;
    },
  },
];

async function main () {
  try {
    let answers = await inquirer.prompt(collectQuestions);
    while (answers.addComponents) {
      const ct = answers.componentType;
      if (ct === 'all') {
        console.log('Collecting all components from the provided env...');
        allAnswers = await collectAllComponents();
        break;
      } else {
        const comps = answers.components;
        if (!hasProperty(allAnswers, ct)) {
          allAnswers[ct] = new Set();
        }
        comps.forEach((c) => allAnswers[ct].add(c));
        answers = await inquirer.prompt(collectQuestions);
      }
    }
    answers = await inquirer.prompt(reviewQuestions);
    console.log(allAnswers);
    console.log('Goodbye');
  } catch (error) {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      console.log(error);
    }
    process.exit(1);
  }
}

main();
