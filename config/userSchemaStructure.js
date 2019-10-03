module.exports = {
    slack: {
        id: { type: String },
        team_id: { type: String },
        name: { type: String },
        deleted: { type: Boolean },
        color: { type: String },
        real_name: { type: String },
        tz: { type: String },
        tz_label: { type: String },
        tz_offset: { type: Number },
        profile: {
            title: { type: String },
            phone: { type: Number },
            skype: { type: String },
            real_name: { type: String },
            real_name_normalized: { type: String },
            display_name: { type: String },
            display_name_normalized: { type: String },
            status_text: { type: String },
            status_emoji: { type: String },
            status_expiration: { type: Number },
            avatar_hash: { type: String },
            email: { type: String },
            image_24: { type: String },
            image_32: { type: String },
            image_48: { type: String },
            image_72: { type: String },
            image_192: { type: String },
            image_512: { type: String },
            status_text_canonical: { type: String },
            team: { type: String }
        },
        is_admin: { type: Boolean },
        is_owner: { type: Boolean },
        is_primary_owner: { type: Boolean },
        is_restricted: { type: Boolean },
        is_ultra_restricted: { type: Boolean },
        is_bot: { type: Boolean },
        is_app_user: { type: Boolean },
        updated: { type: Number },
        has_2fa: { type: Boolean }
    },

    jira: {
        self: { type: String },
        key: { type: String },
        accountId: { type: String },
        accountType: { type: String },
        name: { type: String },
        displayName: { type: String },
        active: { type: Boolean },
        timeZone: { type: String },
        locale: { type: String },
        groups: {
            size: { type: Number },
            items: { type: Array }
        },
        applicationRoles: {
            size: { type: Number },
            items: { type: Array }
        },
        expand: { type: String }
    },
};


