const ConversationController = require('../controllers/conversation.controller');
const ProjectController = require('../controllers/project.controller');
const UserController = require('../controllers/user.controller');
const { ASSOCIATE_ROLES } = require('../includes/constants');
let currentUser;
module.exports = {

    conversationMaster: async (message, slackUserId, channel) => {
        currentUser = await UserController.findOrCreateUser(slackUserId);

        let activeConversation = await ConversationController.getActiveConversation(currentUser);

        if(activeConversation){

            // Command: Add associate to project (task-2)
            if(activeConversation.next_task === 'add_associate' && /<@(.*?)>/.test(message)) {
                const associateId = message.slice(2, -1).toUpperCase();
                const associate = await UserController.findOrCreateUser(associateId);
                activeConversation = await activeConversation.populate('projects');

                const allocation = await ProjectController.addAssociateToProject(activeConversation.project, associate, 'Administrator', ASSOCIATE_ROLES.TEAM_MEMBER);

                activeConversation.status = 'inactive';
                activeConversation.tasks_done.push('add_associate');
                activeConversation.next_task = 'nothing';
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: allocation ? `${associate.slack.profile.real_name} has been added on ${activeConversation.project_name}` : `${associate.slack.profile.real_name} is already allocated to ${activeConversation.project_name}`
                }
            }

            // Command: Remove associate from project (task-2)
            if(activeConversation.next_task === 'remove_associate' && /<@(.*?)>/.test(message)) {
                const associateId = message.slice(2, -1).toUpperCase();
                const associate = await UserController.findOrCreateUser(associateId);
                activeConversation = await activeConversation.populate('projects');

                await ProjectController.removeAssociateFromProject(activeConversation.project, associate);
                activeConversation.status = 'inactive';
                activeConversation.tasks_done.push('remove_associate');
                activeConversation.next_task = 'nothing';
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: `${associate.slack.profile.real_name} has been removed from ${activeConversation.project_name}`
                }
            }

            // Command: Archive Project (task-2)
            if(activeConversation.next_task === 'archive_project' && /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(message)) {
                let projectEndDate = message;
                activeConversation = await activeConversation.populate('projects');

                await ProjectController.archiveProject(activeConversation.project, projectEndDate);

                activeConversation.status = 'inactive';
                activeConversation.tasks_done.push('archive_project');
                activeConversation.next_task = 'nothing';
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: `${activeConversation.project_name} has been archived with ${projectEndDate} as project end date.`
                }
            }

            if(message.includes('close all active conversations')) {
                activeConversation = await activeConversation.populate('projects');
                activeConversation.status = 'inactive';
                activeConversation.forced_close = true;
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: `Okay, ${currentUser.slack.profile.real_name} I have closed all active conversations.`
                }
            }

            if(activeConversation.next_task === 'set_project_owner' && /<@(.*?)>/.test(message)) {
                const associateId = message.slice(2, -1).toUpperCase();
                const associate = await UserController.findOrCreateUser(associateId);
                await ProjectController.addAssociateToProject(activeConversation.project, associate, 'Member', ASSOCIATE_ROLES.PROJECT_OWNER );

                activeConversation.tasks_done.push('set_project_owner');
                activeConversation.next_task = 'set_team_manager';
                await activeConversation.save();
                return {
                    channel: currentUser.slack.name,
                    message: `${associate.slack.real_name} is now the project owner! Who is the Team Manager?`
                }
            }

            if(activeConversation.next_task === 'set_team_manager' && /<@(.*?)>/.test(message)) {
                const associateId = message.slice(2, -1).toUpperCase();
                const associate = await UserController.findOrCreateUser(associateId);
                await ProjectController.addAssociateToProject(activeConversation.project, associate, 'Member', ASSOCIATE_ROLES.TEAM_MEMBER );

                activeConversation.tasks_done.push('set_team_manager');
                activeConversation.next_task = 'set_start_date';
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: `${associate.slack.real_name} is now the Team Manager! What is the Project Start Date? Please enter date in mm/dd/yyyy format.`
                }
            }

            if(activeConversation.next_task === 'set_start_date' && /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(message)) {
                let projectStartDate = message;
                let dateArray = message.split("/");
                projectStartDate = new Date(dateArray[2], dateArray[0] -1 , dateArray[1]);
                await ProjectController.setStartDate(activeConversation.project, projectStartDate);
                activeConversation.status = 'inactive';
                activeConversation.tasks_done.push('set_start_date');
                activeConversation.next_task = 'nothing';
                await activeConversation.save();

                return {
                    channel: currentUser.slack.name,
                    message: `${activeConversation.project_name} start date has been set as ${message}.`
                }
            }

            else{
                return {
                    channel: currentUser.slack.name,
                    message: `${currentUser.slack.profile.real_name} you have an active conversation going on!`
                }
            }
        }

        // TODO: MAKE THIS ELSE A SEPARATE FUNCTION
        else {
            // Command: Create Drive
            if(message.includes('create drive ')) {
                const driveName = message.split('create drive ')[1];
                const response = await ProjectController.createDriveFolder(driveName)
                    .then(res => { return res })
                    .catch(error => { console.log('err', error) });
                let conversation = {
                    user: currentUser,
                    status: 'inactive',
                    command: 'Create Drive',
                    tasks_done: ['create_drive'],
                    next_task: 'nothing',
                    project_name: driveName
                };

                await ConversationController.startConversation(conversation);
                return {
                    channel: currentUser.slack.name,
                    message: response
                }
            }

            // Command: Start Project
            if(message.includes('start project')) {
                const projectName = message.split('start project ')[1];
                const project = await ProjectController.startProject(projectName, currentUser);
                let conversation = {
                    user: currentUser,
                    status: 'active',
                    command: 'Start Project',
                    tasks_done: ['start_project'],
                    next_task: 'set_project_owner',
                    project: project,
                    project_name: projectName
                };
                await ConversationController.startConversation(conversation);
                return {
                    channel: currentUser.slack.name,
                    message: `Congratulations! ${projectName} has been successfully setup now let's assign people to it. Who is the Project Owner?`
                }
            }

            // Command: Add associate to project
            if(message.includes('add associate to project')) {
                const projectName = message.split('add associate to project ')[1];
                const project = await ProjectController.findProject(projectName);
                if(!project){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? Project ${projectName} does not exist!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'active',
                    command: 'Add Associate to project',
                    tasks_done: ['identify_project'],
                    next_task: 'add_associate',
                    project: project,
                    project_name: projectName
                };

                await ConversationController.startConversation(conversation);
                return {
                    channel: currentUser.slack.name,
                    message: `${currentUser.slack.profile.real_name} who would you like to add to project ${projectName}?`
                }

            }

            // Command: Show Active Projects
            if(message.includes('show active projects')) {
                const projects = await ProjectController.getProjects('active');
                if(projects.length === 0){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? No active projects exist!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'inactive',
                    command: 'Show Active Projects',
                    tasks_done: ['show_active_projects'],
                    next_task: 'nothing'
                };

                await ConversationController.startConversation(conversation);

                // TODO: message handling need to go in a helper
                let message = '';
                if(projects.length === 1){
                    message = `${currentUser.slack.profile.real_name} there is only 1 active project: \n Project: ${projects[0].project_name}`;
                } else{
                    message = `${currentUser.slack.profile.real_name} there are a total of ${projects.length} active projects. \n`;
                    projects.forEach(function(project, index){
                        index ++;
                        message = `${message} ${index}) Project: ${project.project_name} \n`
                    });
                }

                return {
                    channel: currentUser.slack.name,
                    message: message
                }

            }

            // Command: Show Archived Projects
            if(message.includes('show archived projects')) {
                const projects = await ProjectController.getProjects('archived');
                if(projects.length === 0){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? There are no archived projects!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'inactive',
                    command: 'Show Archived Projects',
                    tasks_done: ['show_archived_projects'],
                    next_task: 'nothing'
                };

                await ConversationController.startConversation(conversation);

                // TODO: message handling need to go in a helper
                let response = '';
                if(projects.length === 1){
                    response = `${currentUser.slack.profile.real_name} there is only 1 archived project: \n Project: ${projects[0].project_name}`;
                } else{
                    response = `${currentUser.slack.profile.real_name} there are a total of ${projects.length} archived projects. \n`;
                    projects.forEach(function(project, index){
                        index ++;
                        response = `${response} ${index}) Project: ${project.project_name} \n`
                    });
                }

                return {
                    channel: currentUser.slack.name,
                    message: response
                }

            }

            // Command: Remove Associate From Project
            if(message.includes('remove associate from project')) {
                const projectName = message.split('remove associate from project ')[1];
                let project = await ProjectController.findProject(projectName);
                if(!project){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? Project ${projectName} does not exist!`
                    }
                }

                if(project.allocations.length === 0){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? but project ${projectName} does not exist have any allocations!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'active',
                    command: 'Remove Associate From Project',
                    tasks_done: ['identify_project'],
                    next_task: 'remove_associate',
                    project: project,
                    project_name: projectName
                };

                await ConversationController.startConversation(conversation);
                return {
                    channel: currentUser.slack.name,
                    message: `${currentUser.slack.profile.real_name} who would you like to remove from project ${projectName}?`
                }
            }

            // Command: Show Project Summary
            if(message.includes('show project summary')) {
                const projectName = message.split('show project summary ')[1];
                let project = await ProjectController.findProject(projectName);
                if(!project){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? Project ${projectName} does not exist!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'inactive',
                    command: 'Show Project Summary',
                    tasks_done: ['show_project_summary'],
                    next_task: 'nothing',
                    project: project,
                    project_name: projectName
                };

                await ConversationController.startConversation(conversation);

                // TODO: message handling need to go in a helper
                let projectDays = Math.floor((Date.now() - project.start_date) / (1000 * 60 * 60 * 24));
                let response = `Project ${projectName} was started on ${project.start_date.toISOString().slice(0,10)}`;

                if(project.status === 'archived'){
                    response = `${response}. The project was archived on ${project.end_date}. The project lasted for ${projectDays} days`;

                } else{
                    response = projectDays > 1 ? `${response}, it's been ${projectDays} no of days. \n` : `${response}, it's been ${projectDays} days since the project started. \n`;
                    response = project.allocations.length > 0 ? `${response} Currently following team is assigned on this project \n` : `${response} Currently no one is assigned to this project.`;
                }

                project.allocations.forEach(function(user, index){
                    index ++;
                    response = `${response} ${index}) ${user.slack.real_name} \n`
                });

                return {
                    channel: currentUser.slack.name,
                    message: response
                }

            }

            // Command: Archived Project
            if(message.includes('archive project')) {
                const projectName = message.split('archive project ')[1];
                const project = await ProjectController.findProject(projectName);
                if(!project){
                    return {
                        channel: currentUser.slack.name,
                        message: `${currentUser.slack.profile.real_name}? Project ${projectName} does not exist!`
                    }
                }

                let conversation = {
                    user: currentUser,
                    status: 'active',
                    command: 'Archive project',
                    tasks_done: ['identify_project'],
                    next_task: 'archive_project',
                    project: project,
                    project_name: projectName
                };

                await ConversationController.startConversation(conversation);

                return {
                    channel: currentUser.slack.name,
                    message: `${currentUser.slack.profile.real_name} what is project ${projectName}'s end date? Please enter date in mm/dd/yyyy format.`
                }
            }

            else{
                const userName = currentUser.slack.profile.real_name;
                let response = `Sorry ${userName} I don't understand what you are saying?`;
                response = message.includes('close all active conversations') ? `${userName} there are no active conversations going on` : response;
                return {
                    channel: currentUser.slack.name,
                    message: response
                }
            }

        }
    },

};
