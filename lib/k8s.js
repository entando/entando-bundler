const { Readable } = require('stream');
const { spawn } = require('child_process');

function apply(customResource, opts) {
    return new Promise((resolve, reject) => {
        let cmdOpts = opts.namespace ? ['-n', opts.namespace] : [];
        cmdOpts = [...cmdOpts, 'apply', '-f', '-'];
        const child = spawn(`kubectl`, cmdOpts)
        child.stdin.write(`${JSON.stringify(customResource)}\n`);
        child.stdin.end();
        let stdout = [];
        let stderr = [];

        child.stdout.on('data', (data) => {
            stdout = [...stdout, data.toString()];
        });

        child.stderr.on('data', (data) => {
            stderr = [...stderr, data.toString()];
        });

        child.on('close', (code) => {
            if (code != 0) {
                reject(stderr.join());
            }
            resolve(stdout.join());
        });

        child.on('error', (err) => {
            console.log(`An error occurred while installing custom resource ${err}`)
            reject(err);
        })
    });

}

module.exports = {
    apply
}