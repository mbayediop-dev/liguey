const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    description: {
        type: Types.Text,
        isMultiline: true
    },
    distanceEnKM: {
        type: Types.Integer
    },
    prix: {
        type: Types.Integer
    },
    activerMinimumDePrix: {
        type: Types.Checkbox
    },
    minimumDePrix: {
        type: Types.Integer
    },
    // prestation: {
    //     type: Types.Relationship,
    //     ref: "Prestation.actionDistances",
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