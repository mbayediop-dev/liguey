const Types = require('@keystonejs/fields');
const access = require("../services/acl");

const options = [
  { value: 4, label: '4h' },
  { value: 8, label: '8h' },
  { value: 12, label: '12h' },
  { value: 16, label: '16h' },
  { value: 20, label: '20h' },
  { value: 24, label: '24h' },
  { value: 28, label: '28h' },
  { value: 32, label: '32h' },
  { value: 36, label: '36h' },
  { value: 40, label: '40h' },
  { value: 44, label: '44h' },
  { value: 48, label: '48h' },
];

module.exports = {
  fields: {
    jour: {
        type: Types.Select,
        options: 'LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE',
        isRequired: true
    },
    prevu: {
        type: Types.Select,
        options: options,
        dataType: 'integer',
        isRequired: true
    },
    majoration: {
      type: Types.Integer,
      isRequired: true
    },
    services: {
        type: Types.Relationship,
        ref: "Service.penalites",
        many: true
    } 
  },
  labelField: 'jour',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};