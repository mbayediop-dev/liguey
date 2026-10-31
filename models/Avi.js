const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    content: {
        type: Types.Text,
        isMultiline: true,
        isRequired:true
    },
    dateCreation:{
       type: Types.DateTime,
    },
    utilisateur: {
        type: Types.Relationship,
        ref: 'User.avis',
        many: false,
        isRequired:true
    }
  },
  labelField: 'content',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  }
};