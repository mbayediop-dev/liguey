const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    nom: {
        type: Types.Select,
        options: 'PRESTATAIRE, MANDATAIRE, ADMINISTRATEUR',
        // isUnique: true,
        isRequired: true
    },
    desciption: {
      type: Types.Text,
      isMultiline: true
    },
    utilisateurs: {
      type: Types.Relationship,
      ref: "User.roles",
      many: true
    }
  },
  labelField: 'nom',
  access: {
    read:   true, // access.userIsAdminOrOwner,
    update: false, // access.userIsAdminOrOwner,
    create: false, // access.userIsAdmin,
    delete: false, // access.userIsAdmin,
    auth:   true,
  }
};