const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const googleDriveSchema = new Schema({
    id: {type: String},
    name: {type: String},
    permissions: { type: Object }
});

const projectSchema = new Schema({

    project_name: {type: String, unique: true},
    status: {type: String, default: 'active'},
    client_slack_channel: {type: Object,},
    project_slack_channel: {type: Object},
    google_drive: {type: googleDriveSchema },
    jira_details: {type: Object},
    start_date: {type: Date},
    end_date: {type: String},
    archived_date: {type: Date},
    allocations: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],

}, { timestamps: {} }, {strict: false});

const Project = mongoose.model('project', projectSchema);
module.exports = Project;
//