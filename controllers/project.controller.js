const slackService = require('../services/slack.service');
const jiraService = require('../services/jira.service');
const Project = require('../models/project.model');

module.exports = {

    startProject: async(projectName, currentUser) => {
        const projectChannel = await slackService.startChannel(`proj-${projectName}`);
        const clientChannel = await slackService.startChannel(`client-${projectName}`);
        const jiraDetails = await jiraService.createProject(projectName);

        let project = {
            project_name: projectName,
            user_id: currentUser.id,
            client_slack_channel: clientChannel,
            project_slack_channel: projectChannel,
            jira_details: jiraDetails,
            start_date: Date.now()
        };
        const newProject = new Project(project);
        await newProject.save();
        return newProject;
    },

    findProject: async(projectName) => {
        let project = await Project.findOne({"project_name": projectName}).populate('allocations');
        return project;
    },

    addAssociateToProject: async(projectId, associate, associateRole) => {
        let project = await Project.findById(projectId);
        await slackService.addUserToChannel(associate.slack.id, project.client_slack_channel.id);
        await slackService.addUserToChannel(associate.slack.id, project.project_slack_channel.id);
        const projectRole = await jiraService.getProjectRoleId(project.jira_details.id, associateRole);
        await jiraService.addUserToProject(project.jira_details.id, projectRole, associate.jira.key);
        project.allocations.push(associate);
        await project.save();
    },

    getProjects: async(status) => {
        const projects = await Project.find({'status': status});
        return projects;
    },

    removeAssociateFromProject: async(projectId, associate) => {
        let project = await Project.findById(projectId);
        await slackService.removeUserFromChannel(associate.slack.id, project.client_slack_channel.id);
        await slackService.removeUserFromChannel(associate.slack.id, project.project_slack_channel.id);
        const projectRole = await jiraService.getProjectRoleId(project.jira_details.id, 'Member');
        await jiraService.removeUserFromProject(project.jira_details.id, projectRole, associate.jira.accountId);
        let allocationIndex = project.allocations.indexOf(associate);
        if (allocationIndex !== -1) project.allocations.splice(allocationIndex, 1);
        await project.save();
    },
};
