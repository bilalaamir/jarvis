const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    command: {type: String},
    status: {type: String},
    tasks_done: [{type: String}],
    next_task: {type: String},
    project: {
        type: Schema.Types.ObjectId,
        ref: 'project'
    },
    project_name: {type: String},

}, { timestamps: {} }, {strict: false});

const Conversation = mongoose.model('conversation', conversationSchema);
module.exports = Conversation;
