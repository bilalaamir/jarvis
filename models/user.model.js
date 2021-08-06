const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchemaStructure = require('../config/userSchemaStructure');

const userSchema = new Schema({
    slack: userSchemaStructure.slack,
    jira: userSchemaStructure.jira,

    google_drive: {
        email: { type: String, lowercase: true },
        password: { type: String },
        refresh_token: {type: String},
    },
    user_status: {
        type: String,
        default: 'active'
    },
    email: { type: String },

}, { timestamps: {} }, { strict: false });

const User = mongoose.model('user', userSchema);
module.exports = User;
