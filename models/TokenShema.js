const Types =  require('@keystonejs/fields');
const access = require("../services/acl");
const date = new Date();
module.exports = {

    fields: {
        token: {
            type: Types.Text,
        },
        tokenFacebook:{
            type: Types.Text
        },
        passwordUserFacebook:{
           type: Types.Text
        },
        expireAt:{
            type: Types.DateTime,
        },
        user: {
            type: Types.Relationship,
            ref: 'User',
        }
    },
    labelField: 'expireAt',
    access: {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: false,
      }
}

