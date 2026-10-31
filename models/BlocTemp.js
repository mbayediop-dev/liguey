const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    peutAjouterDesBlocs: {
        type: Types.Checkbox
    },
    dureeDuBlocSupEnMunite: {
        type: Types.Integer
    },
    prixDuBlocSup: {
        type: Types.Integer
    },
    minimunEngagement: {
        type: Types.Checkbox
    },
    nombreMinuteMinumum: {
        type: Types.Integer
    },
    matriceHoraire: {
        type: Types.Relationship,
        ref: "MatriceHoraire.blocTemps",
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