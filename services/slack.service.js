const slackUserToken = process.env.SLACK_USER_TOKEN;
const axios = require('axios');

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${slackUserToken}`
};

const baseUrl = process.env.SLACK_API_BASE_URL;

module.exports = {
    startChannel(name) {
        return axios.post(`${baseUrl}/channels.create`, {name}, {headers})
            .then(function (response) {
                return response.data.channel;
            });
    },

    addUserToChannel(userId, channelId) {
        const body = {
            "user": userId,
            "channel": channelId
        };

        return axios.post(`${baseUrl}/channels.invite`, body, {headers})
            .then(res => res.data)
    },

    removeUserFromChannel(user, channel) {
        const body = {
            "user": user,
            "channel": channel
        };

        return axios.post(`${baseUrl}/channels.kick`, body, {headers})
            .then(res => res.data)
    },

    findUser(userId) {
         return axios.get(`${baseUrl}/users.info?user=${userId.toUpperCase()}`,{headers})
            .then(function (response) {
                return response.data.user;
            });
    },

};
