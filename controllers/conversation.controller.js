const slackService = require('../services/slack.service');
const jiraService = require('../services/jira.service');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');

module.exports = {

    getActiveConversation: async(currentUser) => {
        const conversation = await Conversation.findOne({user: currentUser.id, status: 'active'}, {}, {sort: {'created_at': -1}});
        return conversation;
    },

    startConversation: async(conversation) => {
        const newConversation = new Conversation(conversation);
        await newConversation.save();
        return newConversation;
    }
};

