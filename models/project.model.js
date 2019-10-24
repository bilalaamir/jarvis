const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({

    project_name: {type: String, unique: true},
    status: {type: String, default: 'active'},
    client_slack_channel: {type: Object,},
    project_slack_channel: {type: Object},
    google_drive_id: {type: String, unique: true},
    jira_details: {type: Object},
    start_date: {type: Date},
    archived_date: {type: Date},
    allocations: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],

}, { timestamps: {} }, {strict: false});

const Project = mongoose.model('project', projectSchema);
module.exports = Project;
