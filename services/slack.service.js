const slackUserToken = process.env.SLACK_USER_TOKEN;
const axios = require('axios');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${slackUserToken}`
};

module.exports = {
    startChannel(name) {
        axios.post('https://slack.com/api/channels.create', {name}, {headers})
        .then(res => res)
    },

    addUserToChannel(user, channel) {
        const body = {
            "user": user,
            "channel": channel
        };

        axios.post('https://slack.com/api/channels.invite', body, {headers})
            .then(res => res)
    },

    removeUserFromChannel(user, channel) {
        const body = {
            "user": user,
            "channel": channel
        };

        axios.post('https://slack.com/api/channels.kick', body, {headers})
            .then(res => res)
    },

};
