/* eslint-disable quotes,quote-props */
const allVersions = [
  {
    "_id": "@entando/menu@1.0.0",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "1.0.0",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "files": [
      "dist",
      "!test",
      "!modules",
      "!sass",
    ],
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^22.4.3",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "@entando/router": "^1.0.1",
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
    },
    "_npmVersion": "6.1.0",
    "_nodeVersion": "10.0.0",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-NtmOHUJaeITr7tkfaf5AfFsOxS008tfB4X3/bng0/em6QWbtcVgse6IPV6augD2v09HkFt/UdcSP1yKU2RXeqw==",
      "shasum": "43524971302d68ed3823bda09052edccc1138ec7",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-1.0.0.tgz",
      "fileCount": 16,
      "unpackedSize": 43104,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJbINbQCRA9TVsSAnZWagAAP6MQAIUdNljOWoEg8MzxINo2\nFN6M1U4thfWObWa8bGDtoQ5o7YiXwx51wX3jV6NaLHuaE44tFuFeYBOCZV8N\nUD1D3C+m7jRP09wSXQB7xT9yX+nnAs4slUXtT+7tBPBJ/3MOY7d4flSqRCse\nlNkxMi21HU0aVMM2G/jVoXia8kX1fhE0yYlNSoVkX3DpI5tD9h+nbIsNQhXm\nZJ7D6UcpXzvv9+EiECwbQbVFe7LItJu0jAr4fLdxqerzv90Ex06tblq3bEj0\nMGWBD1VdZFGDHnqobNbv9VViRrrsvaF4mu2Oa74qBxnaVaQPSUfhIddhHqGU\npcDBL3fAPj+Ya2pHSU83WUl3L3EdEkJ6zHQZR9UuYEYVO26QLhX+k4w7cJZO\n19A3pmqM67bscbVtB8T44DUcAZMPUyFHQdg3rawnOCeVOAwCkuc79yrGqpZL\niH9PXmrXcNLWYAJEvDuyeW+HZyrYgvpkkkrKXuFPTNOkzigw99/kgWVE8cC5\nlrfVQy8LiHETxQWdDC8cibvcLsGeoXz+yfOm1NHYrEpogDrP1uVeEDxkzQ2X\nHKTel0V3asaTrsuGaQKMEKVpqsd1/DsNk4IU6t4Di0aAvTKsWqkEbKyxRmq2\nsScA/xz6kZmMgwNcoiOOWkFgRprkjwt6YGlM1PR3IIiSw964qw09xTJoUN4N\nW+fQ\r\n=gKex\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_1.0.0_1528878800247_0.5562925540463153",
    },
    "_hasShrinkwrap": false,
  },
  {
    "_id": "@entando/menu@1.0.1",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "1.0.1",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "files": [
      "dist",
      "!test",
      "!modules",
      "!sass",
    ],
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^22.4.3",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "@entando/router": "^1.0.3",
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
    },
    "_npmVersion": "6.1.0",
    "_nodeVersion": "10.0.0",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-xH2bradFU47smQAbLUiws8pINzc/Fdh5A0cLhc2k+HBt25L8CfNJITCTacmlpT1JqPDeZ3kleio4LqC7seA3NQ==",
      "shasum": "efab2a915f3b61d340bbae03ec10b68638ba2fc8",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-1.0.1.tgz",
      "fileCount": 16,
      "unpackedSize": 43104,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJbISEpCRA9TVsSAnZWagAAxDwP/i9Sb9qdnx/iYxBYPQjv\n2C9AxUNLDIDgR278w/yBKT3c79xrVnPa5vFDXVlj56sfx4GLZOrNb4+9LXm/\n8kI9e+DjsCUCg+MBYKvh2PhwlqvUiASgbyYLtl24Lc7PRG6aWC35tnFxnMWm\n8egkG3AWwHjYk5IISLAWs8g920tH4nlb2eMZ0v38feoZ+d85zbBsWF4ezG6A\nvjGRenO96DGweUNeuO8X+dUnQ3fPImXOCj5bWyh3dB51dD3pXeI/pP0uJmDU\n/h/8+PDJITSJB2M8TM641BJs6kLWNFC1753FpMPZzbDDUIMuIFqRSO18PipP\n9cl1DPjp6z1m+ZttaT1hOCJN9bzjnmxF7DHl4I15Sf1ERswnsMi3FGaHUj27\nWA962nqFqR9hiyPoT805smj4QJegc6mSuErWeZovqd0xOcAbtLONxKgS8LTG\nNG0Ax0Ob1hiqx7s3Fjx95eyexnI6nY735Cx8KbGuPwbb6AfajS0EXA4JVc8Q\nIHRd0V6lrxyJwDJdXSxc8c/DUdrQ9M36+6RjnVaCVQjoFIM1ss1acaiFzkDX\nEWC5fHaOpk3ZegrnKvh6/7ZiGIfj7V5nbthgOcuuQNEHmK9Ha6jMMW1OZu/0\nGRdbkdmaIfALm6jMlxSxRJui8r6A3Pou/9SXTo61IxoQMnx1xulFsvip7O0y\nQOLA\r\n=Qgsi\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_1.0.1_1528897823263_0.2666914362056787",
    },
    "_hasShrinkwrap": false,
  },
  {
    "_id": "@entando/menu@1.1.0",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "1.1.0",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "files": [
      "dist",
      "!test",
      "!modules",
      "!sass",
    ],
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^22.4.3",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "@entando/router": "^1.0.3",
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
    },
    "_npmVersion": "6.1.0",
    "_nodeVersion": "10.0.0",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-Gnc6fbhjJe4SDMQAHFiXv+E7vsaksHPJKsjqGpuYpbwtFxM4zemj0JCZ/kaUQqq3iXGkX0mXzLiwXWY+dm7XBg==",
      "shasum": "765773169f091f8fe0c104a090ac6df7f283a43b",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-1.1.0.tgz",
      "fileCount": 17,
      "unpackedSize": 44376,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJbJ4XtCRA9TVsSAnZWagAARk8P/ixflgXM85xT7SqCOzaJ\ndf5lWMzBbhg7rtf9cN8KMzvVVRxv/a42r/5TxYm3pZezV2Tr4S9jAD4vdayB\n6XPKPBcOIftDuP2Ez+AiTjkSrJiZK88L32EduCVLROBZqmIpvVCNJ1buR3ZR\n1/kdswt11JcXD4a5yXvfOZ+X7PfsLBQ+w2KOoszEj+C+KAop8moqlD6VfW+O\n7+tVoiHq7SJeIIWqkPzmCudva217exFmGokm+q0lJWK//u6QMDcuBEqmN4Pq\nGgvh+qiwGxQWSRXeQ/Z7DZZmBrfqlbgMXSCRXO8UelhlYFmanLzip5zs/Fz7\nvYs9Gb7LSx/ZF7xFt4+TQDbht0j20ArptqhZ+Fv1+1D7yQJ53bLGMTLhMtRt\nfXNJTE/yMXh9sIQdidIuL32FYG2u5QVLbQh8FDiVLnP4WE5qoMD3mThe8JTX\nrTBMbgCV8qJ9lzraR5qT+H7zBkspV6wWFOtOkOESQ/cG6l79s3YgbiZvlVSw\nUM1ncgrIIiAjU8eMh3CmU1QtPcd7ShqobtXU9JfFcxOmpBTX6qmGRSa6AC2y\nmLMv5F46LmLdhZBpqnW+wrJiOI+PRKQNQQgn7Rmt2dJfMXW9JdVFCbMPGjWD\n6PkAcI78M0eCMG8y2FYqr8IXcWoBYx1++m7zHfLvtRdLWQ0BLisnDm/NGIVX\nP/vb\r\n=8zpn\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_1.1.0_1529316844969_0.9365477886190978",
    },
    "_hasShrinkwrap": false,
  },
  {
    "_id": "@entando/menu@1.1.1",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "1.1.1",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "files": [
      "dist",
      "!test",
      "!modules",
      "!sass",
    ],
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^22.4.3",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "@entando/router": "^1.1.0",
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
    },
    "_npmVersion": "6.1.0",
    "_nodeVersion": "10.0.0",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-XmqecYzeNelIxMQh9Xg6oOLkRNwK6/FLxDjqeWrTK7zSq0uctlfWM4RY5pZgTo3qKeUyjZhj4MT3lNOMCw+mxw==",
      "shasum": "f2bee71d8ce14b5685a90e81b5026f9d592401ba",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-1.1.1.tgz",
      "fileCount": 17,
      "unpackedSize": 44376,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJbRGf0CRA9TVsSAnZWagAADTsP/A8VAHkOK3leP7IuwWWa\najdLEYPBMyQ5jrF3gIrWYakqc0QK8qKneHBSInY9WQ8LDmJMTS3tMlBoMQne\nomJZZ+Dx3J7KGypmN0ypGPEB1PEXGHoNE2F0yAmJaL0w67DV07RWAguIuyHx\nJf4YOcJ9/4l8IjoiFpoo7GiG5BOh3Xg3pGDZoSPbO2a14sxxCaOH2DgLtrhh\nYvkn4Eqh7EXfrjKlNtR/YFWYlcF5wIqZPH6HV7Q9eclGlAC9tV1Bb3yw9IUW\nPlLfD9xiPkanbLS0LfZ0rvZHvrsyKlOSBYLLq7PkwFVm9XEtsWbWW5IV23+9\nS1oAwXOOyEIBgmv6Zwq0DFTxNp9SI782ygRKbqiLu3X0vCaZJSU5BagGbovi\nAc8+NXa52eIi/+vNDIrKz639y19tuBF/UaCqDZsMRqyqlhDpEjt2Ol7q1nF1\n5EXB+5RWxFGfBrHVi9Ujb1zUbiEnJznzg0yhPGmH8gTaurP3zl43dopd3Nlw\nZEVf03vlE8obF0nitFc/b0crbIOVpW183pd2rPGeJhqGcu94y0P+rEutBcuP\nPTb1rMeUp2jQToZMzTGau2MkD9Njtxf9MgKNPXUi1DP8vWv+KdhrN2NyrVw4\nfCpJpYCaZ9GRnWWLyYphyDihxmZu6gujRrX5CvRHfvC3lY/lKt6/03Gyomlj\npQqO\r\n=hmIx\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_1.1.1_1531209716190_0.2018442079734024",
    },
    "_hasShrinkwrap": false,
  },
  {
    "_id": "@entando/menu@1.1.3",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "1.1.3",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^23.5.0",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "@entando/router": "^1.1.2",
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
    },
    "_npmVersion": "6.4.1",
    "_nodeVersion": "10.0.0",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-q6hvFdMRB4uVI8zIWAqbHesj2uHughQ/OQ7BhrjvrE9hRMAKIZ0j1kNQkPacg4Ce9vB4TCSMXzwuRuPO+ZAIGQ==",
      "shasum": "5730ac9f0261d7e9e3c5dd48d2161ca9752534e0",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-1.1.3.tgz",
      "fileCount": 17,
      "unpackedSize": 44376,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJbzttLCRA9TVsSAnZWagAAdb8P/1M+tJQ4pTVssXhrGV5/\nHnbpE44i6Ew1M2vAjnaZgfUlyeIqF/L3b9doGUZ+reoQqv8xfTP3TLDDTU4z\n9r4Sk/ffH5mNOVx0s5n68ZC0QBAm3DyJAzSmwgjjDVWy8Nzjqph6zI9HcizC\niDlanxaEZv4+npkyg9yqnhXW0JgSiACFjeYaK9jpMYpc5NH/gQf2KZYbcVwk\nDnh/3a2zs5RyZkrfx3na+37deZBPv2wiPERWdt+mQgS5AyXMoqn87iy2desa\njWwlXVR882XsSR2Vjz0ow2pH/a22UIfchVT/HHDan2KPIWOWvO0gnqkJCQ6B\n3H0SxLd8X6Mh+GYSqJsbmA1MpPK00RYRyoK42wzwsSAGT+NVWvT1xfz8/QAk\npTv5qT65chTUDY1FDn9utuURQeP+zw/ke1swhKrn7+3oFIJInEarmDzSvNvX\nG9nt7MCHZG8Bu5NDo4SNcYiPlpvGUFasKf6PaIZI6t2th52IvAf2p1vpFmiV\n9tk0iOFjjCOnuB4zulBxYu9iauWE6jgcI2MUbPIstD267KXLZQPKDayft4dG\nDkIXeG2AFUFV5PFzbVD8DLw7JPbM/Gczdhpmr5I4Nhz/tUqlQ1WI6JxgdAZ+\nG1bu03F68nYP5C2bbXK+ll/z5sVMd09UkBVaE6/AZxS0hF69g1OXinB8FT2R\nohEv\r\n=HnzU\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_1.1.3_1540283210207_0.22880793257570975",
    },
    "_hasShrinkwrap": false,
  },
  {
    "_id": "@entando/menu@2.0.0",
    "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
    "name": "@entando/menu",
    "dist-tags": {
      "latest": "2.0.0",
    },
    "versions": [
      "1.0.0",
      "1.0.1",
      "1.1.0",
      "1.1.1",
      "1.1.3",
      "2.0.0",
    ],
    "time": {
      "created": "2018-06-13T08:33:20.000Z",
      "1.0.0": "2018-06-13T08:33:20.332Z",
      "modified": "2019-08-08T08:28:46.441Z",
      "1.0.1": "2018-06-13T13:50:33.502Z",
      "1.1.0": "2018-06-18T10:14:05.020Z",
      "1.1.1": "2018-07-10T08:01:56.274Z",
      "1.1.3": "2018-10-23T08:26:50.723Z",
      "2.0.0": "2019-08-08T08:28:43.883Z",
    },
    "maintainers": [
      "entando <amministrazione@entando.com>",
    ],
    "description": "react components used to render menus in entando projects",
    "homepage": "https://github.com/entando/frontend-libraries#readme",
    "keywords": [
      "entando",
      "menu",
      "react",
    ],
    "repository": {
      "type": "git",
      "url": "git+https://github.com/entando/frontend-libraries.git",
    },
    "bugs": {
      "url": "https://github.com/entando/frontend-libraries/issues",
    },
    "license": "LGPL-2.1",
    "readmeFilename": "README.md",
    "_cached": true,
    "_contentLength": 0,
    "version": "2.0.0",
    "scripts": {
      "test": "jest --env=jsdom",
      "lint": "eslint ./modules",
      "coverage": "jest --env=jsdom --coverage",
      "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
      "prepublish": "npm run build",
    },
    "main": "dist/js/index.js",
    "publishConfig": {
      "access": "public",
    },
    "devDependencies": {
      "babel-cli": "^6.26.0",
      "babel-core": "^6.26.0",
      "babel-eslint": "^8.2.2",
      "babel-jest": "^22.4.3",
      "babel-plugin-module-resolver": "^3.1.1",
      "babel-preset-env": "^1.6.1",
      "babel-preset-react": "^6.24.1",
      "eslint": "^4.19.1",
      "eslint-config-airbnb": "^16.1.0",
      "eslint-plugin-import": "^2.10.0",
      "eslint-plugin-jsx-a11y": "^6.0.3",
      "eslint-plugin-react": "^7.7.0",
      "jest": "^23.5.0",
      "node-sass": "^4.9.0",
    },
    "jest": {
      "moduleFileExtensions": [
        "js",
      ],
      "moduleDirectories": [
        "node_modules",
        "modules",
        "test",
      ],
      "collectCoverageFrom": [
        "modules/**/*.{js}",
      ],
      "testMatch": [
        "<rootDir>/test/**/?(*.)(spec|test).{js}",
      ],
    },
    "babel": {
      "presets": [
        "env",
        "react",
      ],
      "plugins": [
        [
          "module-resolver",
          {
            "root": [
              "./modules",
            ],
          },
        ],
      ],
    },
    "dependencies": {
      "patternfly-react": "^1.19.1",
      "react": "^16.3.0",
      "react-intl": "^2.4.0",
      "react-router-dom": "^5.0.0",
    },
    "_npmVersion": "6.4.1",
    "_nodeVersion": "10.15.1",
    "_npmUser": "entando <amministrazione@entando.com>",
    "dist": {
      "integrity": "sha512-hG2S0CP716VH6urSd17MT2vpOQJt77yOfDQSTF0hOm60rUuyUFEHpkY5cJ2XI7yLJHQRrOkn7zRR8/uB4VuWPQ==",
      "shasum": "f6f0dc9ffce44871f688275b437d32699a52ff6d",
      "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-2.0.0.tgz",
      "fileCount": 17,
      "unpackedSize": 44200,
      "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJdS908CRA9TVsSAnZWagAA+u0P/0KS8PUDMc8Y0qNP4o5N\niQvlg+E/B7hxWZUjNsx7XxfmhgYMf0aItiojZ2/oaonmm8jLg60t1W1UbUhF\nu4iIkX9YNakrVTL8WnXHNeMUqMDlZiaPnc6K24ENr3uTaccvQ2d8Fe7nRMdA\nrIQTdTUvrioA9lXGBRMZCwzY0AOy7eZqs2gln037rVWJX3vgb77aUVNjuTRa\nZCwrssT9JpdAI6XC/BhCeldakMFXoUkSvzbkeTIT4WmiZecVpkS1Jnwi4+7F\nVcNXGqPn3CS4+QRbCHFgRl8vZuSJ1sCdXNMJ2iRiqU4hRbQmGhKygAyIpMPT\nTsne5pylvxZBKRBKtHZGcsz7m0v/GHV9tl4B42uFqR8dCdDKtf37juXBkktR\npHt4ti5PzGWKJ3cdE9gk1r8fQzrpvcV6U4TTAg/Ujh2s0vdFUfkp8IRKVYdg\nzktCOarQVTe0xUuDM6AIGJVf7amBBwDAyOZEWYNKLlftv1PC/EMMfozph42F\nP8zhxAf9Rf170vK8sY6NLJJ7DGyxCL5wTtvodeNVu+EGvR/bGha2Hh1poaYP\ngP4XJjmdOvntNiqdtMVuR3UxTB9EJzg/D55T/ZqWcCkt8KqwkOEl2rZ+uY4a\n6wYFXJ/w6FDH/5z2I8Am5em/6JzMs/An0ebjVNDh+InDhSTWnaodVfO/60Vj\nA1GU\r\n=MkBb\r\n-----END PGP SIGNATURE-----\r\n",
    },
    "directories": {},
    "_npmOperationalInternal": {
      "host": "s3://npm-registry-packages",
      "tmp": "tmp/menu_2.0.0_1565252923684_0.3203528777296829",
    },
    "_hasShrinkwrap": false,
  },
];

const singleVersion = {
  "_id": "@entando/menu@2.0.0",
  "_rev": "5-77e0b6f3f6ab1511c4a270154ed8cf49",
  "name": "@entando/menu",
  "dist-tags": {
    "latest": "2.0.0",
  },
  "versions": [
    "1.0.0",
    "1.0.1",
    "1.1.0",
    "1.1.1",
    "1.1.3",
    "2.0.0",
  ],
  "time": {
    "created": "2018-06-13T08:33:20.000Z",
    "1.0.0": "2018-06-13T08:33:20.332Z",
    "modified": "2019-08-08T08:28:46.441Z",
    "1.0.1": "2018-06-13T13:50:33.502Z",
    "1.1.0": "2018-06-18T10:14:05.020Z",
    "1.1.1": "2018-07-10T08:01:56.274Z",
    "1.1.3": "2018-10-23T08:26:50.723Z",
    "2.0.0": "2019-08-08T08:28:43.883Z",
  },
  "maintainers": [
    "entando <amministrazione@entando.com>",
  ],
  "description": "react components used to render menus in entando projects",
  "homepage": "https://github.com/entando/frontend-libraries#readme",
  "keywords": [
    "entando",
    "menu",
    "react",
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/entando/frontend-libraries.git",
  },
  "bugs": {
    "url": "https://github.com/entando/frontend-libraries/issues",
  },
  "license": "LGPL-2.1",
  "readmeFilename": "README.md",
  "_cached": true,
  "_contentLength": 0,
  "version": "2.0.0",
  "scripts": {
    "test": "jest --env=jsdom",
    "lint": "eslint ./modules",
    "coverage": "jest --env=jsdom --coverage",
    "build": "babel modules -d dist/js && node-sass --output-style compressed sass/index.scss -o dist/css",
    "prepublish": "npm run build",
  },
  "main": "dist/js/index.js",
  "publishConfig": {
    "access": "public",
  },
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-core": "^6.26.0",
    "babel-eslint": "^8.2.2",
    "babel-jest": "^22.4.3",
    "babel-plugin-module-resolver": "^3.1.1",
    "babel-preset-env": "^1.6.1",
    "babel-preset-react": "^6.24.1",
    "eslint": "^4.19.1",
    "eslint-config-airbnb": "^16.1.0",
    "eslint-plugin-import": "^2.10.0",
    "eslint-plugin-jsx-a11y": "^6.0.3",
    "eslint-plugin-react": "^7.7.0",
    "jest": "^23.5.0",
    "node-sass": "^4.9.0",
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
    ],
    "moduleDirectories": [
      "node_modules",
      "modules",
      "test",
    ],
    "collectCoverageFrom": [
      "modules/**/*.{js}",
    ],
    "testMatch": [
      "<rootDir>/test/**/?(*.)(spec|test).{js}",
    ],
  },
  "babel": {
    "presets": [
      "env",
      "react",
    ],
    "plugins": [
      [
        "module-resolver",
        {
          "root": [
            "./modules",
          ],
        },
      ],
    ],
  },
  "dependencies": {
    "patternfly-react": "^1.19.1",
    "react": "^16.3.0",
    "react-intl": "^2.4.0",
    "react-router-dom": "^5.0.0",
  },
  "_npmVersion": "6.4.1",
  "_nodeVersion": "10.15.1",
  "_npmUser": "entando <amministrazione@entando.com>",
  "dist": {
    "integrity": "sha512-hG2S0CP716VH6urSd17MT2vpOQJt77yOfDQSTF0hOm60rUuyUFEHpkY5cJ2XI7yLJHQRrOkn7zRR8/uB4VuWPQ==",
    "shasum": "f6f0dc9ffce44871f688275b437d32699a52ff6d",
    "tarball": "https://registry.npmjs.org/@entando/menu/-/menu-2.0.0.tgz",
    "fileCount": 17,
    "unpackedSize": 44200,
    "npm-signature": "-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJdS908CRA9TVsSAnZWagAA+u0P/0KS8PUDMc8Y0qNP4o5N\niQvlg+E/B7hxWZUjNsx7XxfmhgYMf0aItiojZ2/oaonmm8jLg60t1W1UbUhF\nu4iIkX9YNakrVTL8WnXHNeMUqMDlZiaPnc6K24ENr3uTaccvQ2d8Fe7nRMdA\nrIQTdTUvrioA9lXGBRMZCwzY0AOy7eZqs2gln037rVWJX3vgb77aUVNjuTRa\nZCwrssT9JpdAI6XC/BhCeldakMFXoUkSvzbkeTIT4WmiZecVpkS1Jnwi4+7F\nVcNXGqPn3CS4+QRbCHFgRl8vZuSJ1sCdXNMJ2iRiqU4hRbQmGhKygAyIpMPT\nTsne5pylvxZBKRBKtHZGcsz7m0v/GHV9tl4B42uFqR8dCdDKtf37juXBkktR\npHt4ti5PzGWKJ3cdE9gk1r8fQzrpvcV6U4TTAg/Ujh2s0vdFUfkp8IRKVYdg\nzktCOarQVTe0xUuDM6AIGJVf7amBBwDAyOZEWYNKLlftv1PC/EMMfozph42F\nP8zhxAf9Rf170vK8sY6NLJJ7DGyxCL5wTtvodeNVu+EGvR/bGha2Hh1poaYP\ngP4XJjmdOvntNiqdtMVuR3UxTB9EJzg/D55T/ZqWcCkt8KqwkOEl2rZ+uY4a\n6wYFXJ/w6FDH/5z2I8Am5em/6JzMs/An0ebjVNDh+InDhSTWnaodVfO/60Vj\nA1GU\r\n=MkBb\r\n-----END PGP SIGNATURE-----\r\n",
  },
  "directories": {},
  "_npmOperationalInternal": {
    "host": "s3://npm-registry-packages",
    "tmp": "tmp/menu_2.0.0_1565252923684_0.3203528777296829",
  },
  "_hasShrinkwrap": false,
};

const singleVersionInvalidName = {
  "_id": "training_bundle@1.0.0",
  "name": "training_bundle",
  "description": "A bundle for entando digital-exchange built with JHipster Entando Blueprint",
  "dist-tags": {
    "latest": "1.0.0",
  },
  "versions": [
    "1.0.0",
  ],
  "_rev": "1",
  "time": {
    "created": "2020-02-21T13:33:28.898Z",
    "modified": "2020-02-21T13:33:28.898Z",
    "1.0.0": "2020-02-21T13:33:28.898Z",
  },
  "_cached": false,
  "_contentLength": 0,
  "version": "1.0.0",
  "main": "descriptor.yaml",
  "keywords": [
    "entando6",
    "digital-exchange",
  ],
  "license": "LGPL3",
  "readme": "ERROR: No README data found!",
  "_nodeVersion": "12.15.0",
  "_npmVersion": "6.13.4",
  "dist": {
    "integrity": "sha512-BFU0wZ9PUdZfDtY6cx3rFP1N1eJZLGXmpWU6DG0I5QkIVauWnPFzypdWmRSBnkNfop+zvT3qLINpa1zmlAVSmg==",
    "shasum": "22244652b0f9f66582ed1125f594689ba5ddc044",
    "tarball": "http://nexus.lab.entando.org/repository/npm-entando-demo/training_bundle/-/training_bundle-1.0.0.tgz",
  },
};

module.exports = {
  singleVersionInvalidName,
  singleVersion,
  allVersions,
};
