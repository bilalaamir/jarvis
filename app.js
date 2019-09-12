const slackBot = require('slackbots');
const dotenv = require('dotenv').config();
const ProjectController = require('./controllers/project.controller');

const slack_bot_token = process.env.SLACK_BOT_TOKEN;
const slack_user_token = process.env.SLACK_USER_TOKEN;
const slack_bot_name = process.env.SLACK_BOT_NAME;

const bot = new slackBot({
    token: 'xoxb-750800828806-748602685536-ny6NhbwDhH1ILpqLVMUvgQ7R',
    name: 'jarvis'
});


// Start Handler
bot.on('start', () => {

    bot.postMessageToChannel(
        'general',
        'I am ready to go Sir!',
        // params
    );

// Error Handler
bot.on('error', (err) => console.log(err));

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }
    console.log('Message', data);
    handleMessage(data.text.toLowerCase());
});


// Response to Data
function handleMessage(message) {
    if(message.includes('start project')) {
        startProject(message);
    }
}

function startProject(message) {
    const projectName = message.split('start project ')[1];
    ProjectController.startProject(projectName).then(resp => {
        bot.postMessageToChannel(
            'general',
            `Congratulations! ${projectName} has been successfully setup`
        )
    });
}


});
