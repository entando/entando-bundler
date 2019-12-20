const { exec } = require('child_process');


function registryCmd(npmCommand) {
    return npmCommand;
    // return registry ? `${npmCommand} --registry ${registry}` : npmCommand;
}

function getBundleInfo(bundle_name = '') {
    return new Promise((resolve, reject) => {
        let cmd = registryCmd(`npm view ${bundle_name} --json`);
        exec(cmd, {windowsHide: true}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            resolve(JSON.parse(stdout));
        });
    });
}


function searchEntandoBundle(bundle_name = '') {
    return new Promise((resolve, reject) => {
        let cmd = registryCmd(`npm search ${bundle_name} entando6 --json`);
        exec(cmd, {windowsHide: true}, (err, stdout, stderr) => {
            if(err) {
                reject(err);
            }
            resolve(JSON.parse(stdout));
        })
    });
}

module.exports = {
    registryCmd,
    getBundleInfo
}