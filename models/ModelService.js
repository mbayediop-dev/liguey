const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    nom: {
        type: Types.Select,
        options: 'HORAIRE, DISTANT, UNITE, FIXE, PAR_JOUR, BLOC_DE_TEMPS',
        isRequired: true
    },
    services: {
        type: Types.Relationship,
        ref: "Service.model",
        many: true
    } 
  },
  labelField: 'nom',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: true, // access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};