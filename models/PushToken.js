const Types =  require('@keystonejs/fields');
const access = require("../services/acl");
module.exports = { 

    fields: {
        token: {
            type: Types.Text,
            isUnique: true
        },
        utilisateur: {
            type: Types.Relationship,
            ref: 'User.pushTokens',
            many: false
        }
    },
    labelField: 'token',
    access: {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: false,
      }
}

