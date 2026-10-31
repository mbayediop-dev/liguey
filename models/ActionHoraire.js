const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    description: {
        type: Types.Text,
        isMultiline: true
    },
    // prestation: {
    //     type: Types.Relationship,
    //     ref: "Prestation.actionHoraires",
    //     many: false
    // } 
  },
  labelField: 'description',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};