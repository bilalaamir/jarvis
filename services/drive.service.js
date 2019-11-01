const {google} = require('googleapis');
const uuid = require('uuid');
const async = require('async');

const auth = new google.auth.GoogleAuth({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/drive']
});

async function getDrive() {
    try {
        let client = await auth.getClient();
        let drive = google.drive({
            version: 'v3',
            auth: client
        });
        return drive;
    }
    catch(err) {
        console.log('err', err);
    }
}

module.exports = {
    createFolder: async(name) => {
    let fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
    };
    let drive = await getDrive();
    return await drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
    }).then((file => {
        return file.data;
    })).catch(err => {
        //TODO create and throw a generic error handler
        console.log('error', err);
    });
    },
    createDrive: async(name) => {
        let driveMetadata = {
            'name': name,
        };
        let requestId = uuid.v4();
        let drive = await getDrive();

        return await drive.drives.create({
                resource: driveMetadata,
                requestId: requestId,
                fields: 'id, name'}).then((drive => {
            return drive.data;
        })).catch(err => {
            console.log('error', err);
        });
    },
    setPermissions: async(permissions, fileID) => {
        let drive = await getDrive();
        return permissions.reduce(async (acc, permission) => {
            let user = permission.user;
                delete permission.user;
            let res = await drive.permissions.create({
                resource: permission,
                fileId: fileID,
                sendNotificationEmails: false,
                fields: '*',
            });
            acc[user] = res.data;
            return acc;
        }, {})
    },
    removePermission: async(permissionId, fileID) => {
        let drive = await getDrive();
        console.log('permission id', permissionId);
        return await drive.permissions.delete({
            permissionId: permissionId,
            fileId: fileID,
            sendNotificationEmails: false,
            fields: '*',
        }).then((res => {
            console.log('res', res.data);
            return res.data;
        })).catch(err => {
            //TODO create and throw a generic error handler
            console.log('error', err);
        });
    },
    archiveProject: async(fileID) => {
        let drive = await getDrive();
        let body = {'title': 'copied file',
            'parents': [ {'id': '1KgQZJQ1iLKTBzELZfx736vAIsCSrtyih'} ]
        };
        return await drive.files.get({
            fileId: fileID
        }).then((file => {
            console.log('file', file.data);
            return file.data;
        })).catch(err => {
            //TODO create and throw a generic error handler
            console.log('error', err);
        });

    },
    getProject: async(fileID) => {
        let drive = await getDrive();
        return await drive.files.get({
            fileId: fileID
        }).then((file => {
            console.log('file', file.data);
            return file.data;
        })).catch(err => {
            //TODO create and throw a generic error handler
            console.log('error', err);
        });

    },
    retrieveAllFilesInFolder: async(folderId, callback) => {
            let drive = await getDrive();
            let pageToken = null;
            // Using the NPM module 'async'
            await async.doWhilst(function (callback) {
                drive.files.list({
                    q: "mimeType='application/vnd.google-apps.folder'",
                    fields: 'nextPageToken, files(id, name)',
                    spaces: 'drive',
                    pageToken: pageToken
                }, function (err, res) {
                    if (err) {
                        // Handle error
                        console.error(err);
                        callback(err)
                    } else {
                        console.log(res);
                        res.data.files.forEach(function (file) {
                            console.log('Found file: ', file.name, file.id);
                        });
                        pageToken = res.nextPageToken;
                        callback();
                    }
                });
            }, function () {
                return !!pageToken;
            }, function (err) {
                if (err) {
                    // Handle error
                    console.error(err);
                } else {
                    // All pages fetched
                }
            })
    },
};
