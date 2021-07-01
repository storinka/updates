const fs = require('fs');
const Promise = require('bluebird');
const marked = require('marked');

const updatesFolder = 'updates';

readdir(updatesFolder)
    .then(files => {
        Promise.allSettled(files.map(file => {
            const match = file.match(/([0-9]{4}-[0-9]{2}-[0-9]{2}).md/u);

            if (match) {
                const date = match[1];

                console.log('reading', file);

                return read(updatesFolder + '/' + file).then(content => {
                    return {
                        date,
                        content
                    };
                })
            }

            return Promise.resolve(null);
        })).then(promises => {
            const updates = promises
                .map(promise => promise.value())
                .filter(update => update)
                .map(update => ({
                    ...update,
                    content_html: marked(update.content),
                }));

            updates.sort((a, b) => {
                const aDate = Date.parse(a.date);
                const bDate = Date.parse(b.date);

                return bDate - aDate;
            });

            fs.writeFile('updates.json', JSON.stringify(updates), function (err) {
                if (err) {
                    throw err;
                }

                console.log('updates.json generation completed!');
            });

        });
    });

function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', function (err, content) {
            if (err) {
                reject(err);
            }

            resolve(content);
        });
    });
}

function readdir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, {}, function (err, content) {
            if (err) {
                reject(err);
            }

            resolve(content);
        });
    });
}
