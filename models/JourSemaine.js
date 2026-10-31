const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    jour: {
        type: Types.Select,
        options: 'LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE',
        isRequired: true
    },
    horaires: {
        type: Types.Relationship,
        ref: "Horaire.joursDisponibles",
        many: true
    } 
  },
  labelField: 'jour',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdmin,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};