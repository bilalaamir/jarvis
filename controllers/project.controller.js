const slackService = require('../services/slack.service');
const jiraService = require('../services/jira.service');
const driveService = require('../services/drive.service');
const Project = require('../models/project.model');

async function createDriveFolder(name, user) {
    let teamDrive = await driveService.createFolder(name).then(res => {  return res }).catch(err => { return err });
    let permissions = [
        {
            'type': 'user',
            'role': 'writer',
            'emailAddress': user.email,
            'user': user.id

        }
    ];
    return await driveService.setPermissions(permissions, teamDrive.id)
        .then( res => { console.log('permission', res); return teamDrive = { ...teamDrive, permissions: res } })
        .catch( err => { console.log(err) } );

}

module.exports = {

    startProject: async(projectName, currentUser) => {
        const projectChannel = await slackService.startChannel(`proj-${projectName}`).catch(err => { console.log('could not create project channel', err) });
        const clientChannel = await slackService.startChannel(`client-${projectName}`).catch(err => { console.log('could not create client channel', err) });
        const jiraDetails = await jiraService.createProject(projectName).catch(err => { console.log('could not create JIRA project', err) });
        const googleDrive = await createDriveFolder(projectName, currentUser).catch(err => { console.log('could not create drive', err) });
        const newProject = new Project({
            project_name: projectName,
            user_id: currentUser.id,
            client_slack_channel: clientChannel,
            project_slack_channel: projectChannel,
            jira_details: jiraDetails,
            google_drive: googleDrive,
            start_date: Date.now()
        });
        await newProject.save();
        return newProject;
    },

    findProject: async(projectName) => {
        let project = await Project.findOne({"project_name": projectName}).populate('allocations');
        return project;
    },

    addAssociateToProject: async(projectId, associate, associateRole, role) => {
        let project = await Project.findById(projectId);
        await slackService.addUserToChannel(associate.slack.id, project.client_slack_channel.id);
        await slackService.addUserToChannel(associate.slack.id, project.project_slack_channel.id);
        const projectRole = await jiraService.getProjectRoleId(project.jira_details.id, associateRole);
        await jiraService.addUserToProject(project.jira_details.id, projectRole, associate.jira.key);
        //TODO take out of controller and create object inside service
        let permissions = [
            {
                'type': 'user',
                'role': driveService.getRoleType(role),
                'emailAddress': associate.email,
                'user': associate.id,
            }
        ];
        let projectPermissions = { ...project.google_drive.permissions };
        let googleDrive = await driveService.setPermissions(permissions, project.google_drive.id)
            .then( res => { console.log( 'set drive permissions response: ', res ); return { ...projectPermissions, ...res } })
            .catch( err => { console.log( 'set drive permissions error: ', err ) } );
        project.allocations.push(associate);
        project.google_drive.permissions = Object.assign(project.google_drive.permissions, googleDrive);
        console.log('project drive permissions', Object.assign(project.google_drive.permissions, googleDrive));
        project.markModified('google_drive');
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
        const projectRole = await jiraService.getProjectRoleId(project.jira_details.id, 'Administrator');
        await jiraService.removeUserFromProject(project.jira_details.id, projectRole, associate.jira.accountId).catch(err => {console.log(err)});;
        console.log('user id', project.google_drive.permissions[associate.id].id);
        await driveService.removePermission(project.google_drive.permissions[associate.id].id, project.google_drive.id).catch(err => {console.log(err)});
        let allocationIndex = project.allocations.indexOf(associate);
        if (allocationIndex !== -1) project.allocations.splice(allocationIndex, 1);
        delete project.google_drive.permissions[associate.id];
        project.markModified('google_drive');
        await project.save();
    },

    archiveProject: async(projectId, projectEndDate) => {
        let project = await Project.findById(projectId);
        await slackService.archiveChannel(project.client_slack_channel.id);
        await slackService.archiveChannel(project.project_slack_channel.id);
        await jiraService.updateProject(project.jira_details.id, {name: `${project.project_name}-archived`});

        project.status = 'archived';
        project.project_name = `${project.project_name}-archived`;
        project.client_slack_channel.is_archived = true;
        project.project_slack_channel.is_archived = true;
        project.end_date = projectEndDate;
        await project.save();
    },

    setStartDate: async(projectId, projectStartDate) => {
        let project = await Project.findById(projectId);
        project.start_date = projectStartDate;
        await project.save();
    },

    createDriveFolder
};
