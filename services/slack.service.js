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
    }
};
