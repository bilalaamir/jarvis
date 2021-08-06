const slackService = require('../services/slack.service');
const jiraService = require('../services/jira.service');
const User = require('../models/user.model');

module.exports = {

    findOrCreateUser: async(slackUserId) => {
        const userExists = await User.findOne({ "slack.id": slackUserId });
        if (userExists) {
            return userExists;
        }

        let userSlackDetails = await slackService.findUser(slackUserId);
        let userJiraDetails = await jiraService.findUser(userSlackDetails.profile.email);

        const newUser = {
            slack: userSlackDetails,
            jira: userJiraDetails,
            email: userSlackDetails.profile.email
        };

        const user = new User(newUser);
        await user.save();

        return user
    }
};

