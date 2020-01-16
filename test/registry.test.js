const registry = require('../lib/registry');
const child_process = require('child_process');

// Reference for this construct: https://stackoverflow.com/a/43790087/3449226
jest.mock('child_process', () => ({
    exec: jest.fn((name, opt, callback) => callback('','',''))
}));

describe('Registry module', function() {

    beforeEach(() => {
        child_process.exec.mockClear();
    })

    it("Should return all versions even if a specific one is required", () => {
        let requestedModule = '@entando/menu@1.0.0';
        let allVersionModule = registry.allModuleVersions(requestedModule);
        expect(allVersionModule).toBe('@entando/menu@*');
    })

    it("Should work even when no organization is provided", () => {
        let requestedModule = 'menu@1.0.0';
        let allVersionmodule = registry.allModuleVersions(requestedModule);
        expect(allVersionmodule).toBe('menu@*');
    })

    it("Should work when nor organization or version are provided", () => {
        let requestedModule = 'menu';
        let allVersionmodule = registry.allModuleVersions(requestedModule);
        expect(allVersionmodule).toBe('menu@*');
    })

    it("Should issue the npm command with all the available versions", () => {
        registry.getBundleInfo({'name': '@entando/bundle@1.0.0'});
        let executed = child_process.exec.mock.calls[0][0]
        expect(executed).toBe('npm view @entando/bundle@* --json');
    })

    it("Should issue the npm command using the provided registry", () => {
        let requestedRegistry = 'https://registry.npmjs.org';
        registry.getBundleInfo({'name': '@entando/bundle@1.0.0', 'registry': requestedRegistry});
        let executed = child_process.exec.mock.calls[0][0];
        expect(executed).toBe(`npm view @entando/bundle@* --json --registry=${requestedRegistry}`);
    })
})
