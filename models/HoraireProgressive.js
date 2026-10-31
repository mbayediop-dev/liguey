const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    tarif: {
        type: Types.Float,
        isRequired: true
    },
    minimunEngagement: {
        type: Types.Checkbox
    },
    nombreHeureMinimum: {
        type: Types.Integer
    },
    matriceHoraire: {
        type: Types.Relationship,
        ref: "MatriceHoraire.horaireProgressives",
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