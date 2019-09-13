const slackBot = require('slackbots');
const dotenv = require('dotenv').config();
const ProjectController = require('./controllers/project.controller');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const bot = new slackBot({
    token: process.env.SLACK_BOT_TOKEN,
    name: process.env.SLACK_BOT_NAME
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
