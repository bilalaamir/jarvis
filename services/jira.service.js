const jiraClient = require('jira-connector');
const jiraApiToken = process.env.JIRA_API_TOKEN;
const axios = require('axios');

const jira = new jiraClient({
    host: process.env.JIRA_HOST ,
    basic_auth: {
        email: process.env.JIRA_EMAIL,
        api_token: process.env.JIRA_API_TOKEN
    }
});

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${jiraApiToken}`
};

const baseUrl = process.env.JIRA_API_BASE_URL;
const leadAccountID = process.env.JIRA_LEAD_ACCOUNT_ID;

module.exports = {
    createProject(name) {
        let body = {
            "key": name.toUpperCase(),
            "name": name,
            "projectTypeKey": "software",
            "projectTemplateKey": "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban",
            "description": "testing api",
            "leadAccountId": leadAccountID
        };

        return axios.post(`${baseUrl}/rest/api/3/project`, body, {headers})
            .then(function (response) {
                return response.data;
            });
    },

    findUser(userEmail) {
        return axios.get(`${baseUrl}/rest/api/2/user/search?username=${userEmail}`,{headers})
            .then(res => res.data[0])
    },

    addUserToProject(jiraProjectId, associateRole, userKey) {
        let body = {
          "user": [userKey]
        };
        console.log('TEST', body);
        return axios.post(`${baseUrl}/rest/api/3/project/${jiraProjectId}/role/${associateRole}`, body ,{headers})
            .then(function (response) {
                return response.data;
            })
            .catch(function(err) { console.log('error', err) });
    },

    getProjectRoleId(jiraProjectId, role) {
        return axios.get(`${baseUrl}/rest/api/3/project/${jiraProjectId}/role` ,{headers})
            .then(function (response) {
                return response.data[role].split(`${baseUrl}/rest/api/3/project/${jiraProjectId}/role/`)[1];
            });
    },

    removeUserFromProject(jiraProjectId, associateRole, userId) {
        return axios.delete(`${baseUrl}/rest/api/3/project/${jiraProjectId}/role/${associateRole}?user=${userId}` ,{headers})
            .then(function (response) {
                return response
            });
    },

    updateProject(jiraProjectId, body) {
        return axios.put(`${baseUrl}/rest/api/3/project/${jiraProjectId}`, body ,{headers})
            .then(function (response) {
                return response.data
            });
    },
};
