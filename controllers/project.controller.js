const slackService = require('../services/slack.service');
const jiraService = require('../services/jira.service');

module.exports = {

    startProject: async(projectName) => {
        slackService.startChannel(`proj-${projectName}`);
        slackService.startChannel(`client-${projectName}`);
        jiraService.createProject(projectName);
        return true
    }
};

