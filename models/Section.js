const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    nom: {
        type: Types.Text,
        isRequired: true
    },
    description: {
        type: Types.Text,
        isMultiline: true
    },
    remiseSurObjet: {
        type: Types.Checkbox
    },
    nombreObjetRemise: {
        type: Types.Integer
    },
    remiseFromNombreObjet: {
        type: Types.Integer
    },
    remiseEnPourcentage: {
        type: Types.Integer
    },
    prestation: {
        type: Types.Relationship,
        ref: "Prestation.sections",
        many: false
    },
    objets: {
        type: Types.Relationship,
        ref: "Objet.section",
        many: true
    } 
  },
  labelField: 'nom',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};