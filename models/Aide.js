const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    question: {
        type: Types.Text,
        isMultiline: true
    },
    reponse: {
        type: Types.Text,
        isMultiline: true
    }
  },
  labelField: 'question',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: true,
    delete: access.userIsAdmin,
    auth: true,
  }
};