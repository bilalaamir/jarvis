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

module.exports = {
    createProject(name) {
        let body = {
            "key": name.toUpperCase(),
            "name": name,
            "projectTypeKey": "software",
            "projectTemplateKey": "com.pyxis.greenhopper.jira:gh-simplified-agility-kanban",
            "description": "testing api",
            "leadAccountId": "5ac8a5247b9e190395841376"
        };

        axios.post('https://jarvisbot.atlassian.net/rest/api/3/project', body, {headers})
            .then(res => res)
    }
};
