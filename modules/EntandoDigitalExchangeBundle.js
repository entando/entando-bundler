class EntandoDigitalExchangeBundle {
    constructor(npmBundles = []) {

        function Bundle(npmModules = []) { 
            return npmModules.filter(m => {
                return Object.keys(m).length > 0
            }).map(m => {
                return {
                    "name": m.name,
                    "description": m.description,
                    "version": m.version,
                    "keywords": m.keywords,
                    "repository": m.repository,
                    "dist": m.dist,
                    "author": m.author,
                    "maintainers": m.maintainers,
                }
            });
        }
    }
}