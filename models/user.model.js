const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    slack: {
        id: { type: String },
        email: { type: String, lowercase: true }
    },
    jira: {
        id: { type: String },
        email: { type: String, lowercase: true }
    },
    google_drive: {
        email: { type: String, lowercase: true },
        password: { type: String },
        refresh_token: {type: String},
    },
    user_status: {
        type: String,
        enum: ['pending', 'active', 'deactive'],
        default: 'pending'
    },
    email: { type: String },

}, { timestamps: {} }, { strict: false });

const User = mongoose.model('user', userSchema);
module.exports = User;
