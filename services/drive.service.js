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
        'mimeType': 'application/vnd.google-apps.folder'
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
            'name': name
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
        await async.eachSeries(permissions, function (permission, permissionCallback) {
        drive.permissions.create({
            resource: permission,
            fileId: fileID,
            fields: 'id',
        }, function (err, res) {
            if (err) {
                // Handle error...
                console.error(err);
                permissionCallback(err);
            } else {
                console.log('Permission ID: ', res)
                permissionCallback();
            }
        });
    }, function (err) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            // All permissions inserted
            return 'Permissions successfully inserted'
        }
    });
    }
};
