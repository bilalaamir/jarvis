const slackBot = require('slackbots');
const dotenv = require('dotenv').config();
const ConversationHelper = require('./helpers/conversation.helper');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const bot = new slackBot({
    token: process.env.SLACK_BOT_TOKEN,
    name: process.env.SLACK_BOT_NAME
});


// Wake Up Jarvis
bot.on('start', () => {

    // Message Handler
    bot.on('message', (data) => {

        if(data.type !== 'message' || !data.user){
            return;
        }

        return ConversationHelper.conversationMaster(data.text.toLowerCase(), data.user, '').then(response => {
            bot.postTo(
                response.channel,
                response.message
            )
        });
    });

    // Troubleshoot Jarvis
    // bot.on('error', (err) => console.log(err));
});
