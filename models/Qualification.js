const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    type: {
        type: Types.Select,
        isRequired: true,
        options: 'HEROS_QUALIFIES, TOUS_LES_HEROS'
    },
    description: {
      type: Types.Text,
      isMultiline: true
    },
    services: {
        type: Types.Relationship,
        ref: "Service.qualifications",
        many: true
    }
  },
  labelField: 'type',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
};