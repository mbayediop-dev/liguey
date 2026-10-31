const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    type: {
        type: Types.Select,
        options: 'SITE, QUISOMMESNOUS, SUIVIDONNEES, CONTACT, AIDE, INFOLEGAL',
        isRequired: true,
        isUnique: true
    },
    content: {
        type: Types.Text,
        isMultiline: true
    }
  },
  labelField: 'type',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};