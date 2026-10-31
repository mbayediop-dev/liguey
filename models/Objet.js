const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    description: {
        type: Types.Text,
        isMultiline: true
    },
    prix: {
        type: Types.Integer
    },
    section: {
        type: Types.Relationship,
        ref: "Section.objets",
        many: false
    } 
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