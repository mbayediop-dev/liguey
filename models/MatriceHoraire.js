const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    horaireProgressives: {
        type: Types.Relationship,
        ref: "HoraireProgressive.matriceHoraire",
        many: true
    },
    blocTemps: {
        type: Types.Relationship,
        ref: "BlocTemp.matriceHoraire",
        many: true
    } 
  },
  labelField: 'horaireProgressives',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};