const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    nouvelleDate: {
        type: Types.DateTime
    },
    nouvelleHeure: {
        type: Types.Text
    },
    totalFacturer:{
      type: Types.Float
    },
    reversePrestataire:{
      type: Types.Float
    },
    typeMajoration: {
      type: Types.Text,
      defaultValue: 'HORAIRE_MATIN'
    },
    dureeMajorationInHeure: {
      type: Types.Float,
      defaultValue: 0.00
    },
    pourcentageMajoration: {
      type: Types.Integer,
      defaultValue: 0
    },
    statut: {
        type: Types.Select,
        options: 'EN_COURS, ACCEPTER, REJETER',
        defaultValue: 'EN_COURS'
    }
  },
  labelField: 'statut',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: access.userIsAdmin,
    auth: true,
  }
};