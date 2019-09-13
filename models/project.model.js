const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({

    projectName: {type: String},
    status: {type: String, default: 'pending'},
    clientSlack: {type: Object,},
    projectSlack: {type: Object},
    jira: {type: Object},

}, { timestamps: {} }, {strict: false});

const Project = mongoose.model('project', projectSchema);
module.exports = Project;
