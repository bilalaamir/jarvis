module.exports = {
    conversations: [
            {
                "command": "Add Associate to project",
                "tasks": [
                    {
                        "id": 1,
                        "task": "identify_project",
                        "conversation" : {
                            "user": "Add Associates to project",
                            "bot": "Who would you like to add to project",
                            "error": "Project doesn’t exist"
                        }
                    },
                    {
                        "id": 2,
                        "task": "add_associate",
                        "conversation" : {
                            "user": "<@userws>",
                            "bot": " has been added on ",
                            "error": "Invalid User"
                        }
                    }
                ],
                "total_tasks": 2
        },

        {
            "command": "Start Project",
            "tasks": [
                {
                    "id": 1,
                    "task": "start_project",
                    "conversation" : {
                        "user": "Add Associates to project",
                        "bot": "Who would you like to add to project",
                        "error": "Project doesn’t exist"
                    }
                }
            ],
            "total_tasks": 1
        },

        {
            "command": "Show Active Projects",
            "tasks": [
                {
                    "id": 1,
                    "task": "show_active_projects",
                    "conversation" : {
                        "user": "Show Active Projects",
                        "bot": "There are a total of 30 Active Projects",
                        "error": "No active projects exists"
                    }
                }
            ],
            "total_tasks": 1
        },

        {
            "command": "Show Archived Projects",
            "tasks": [
                {
                    "id": 1,
                    "task": "show_archived_projects",
                    "conversation" : {
                        "user": "Show Archived Projects",
                        "bot": "There are a total of 30 Archived Projects",
                        "error": "No Archived projects exists"
                    }
                }
            ],
            "total_tasks": 1
        },

        {
            "command": "Show Project Summary",
            "tasks": [
                {
                    "id": 1,
                    "task": "show_project_summary",
                    "conversation" : {
                        "user": "Show Project Summary",
                        "bot": "Project Details",
                        "error": "Project does not exist"
                    }
                }
            ],
            "total_tasks": 1
        },

    ]

};


