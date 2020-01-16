const bundle = require('../lib/de_bundle');

describe('Bundle naming', () => {

    it("Should not validate module with organization in the name", () => {
        let name = '@entando/name';
        expect(bundle.validateModuleName(name)).toBe(false);
    })

    it("Should fallback to module name if no custom name is provided", () => {
        expect(bundle.generateModuleName(undefined, {'name': 'entando'})).toBe('entando');
    })
    
    it("Should use provided name for the module", () => {
        expect(bundle.generateModuleName('entando', {})).toBe('entando');
    })

})