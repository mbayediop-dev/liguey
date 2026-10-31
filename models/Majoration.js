const Types = require('@keystonejs/fields');
const access = require("../services/acl");

const optionsHoraires = [
  { value: 24, label: '0h' },
  { value: 1, label: '1h' },
  { value: 2, label: '2h' },
  { value: 3, label: '3h' },
  { value: 4, label: '4h' },
  { value: 5, label: '5h' },
  { value: 6, label: '6h' },
  { value: 7, label: '7h' },
  { value: 8, label: '8h' },
  { value: 9, label: '9h' },
  { value: 10, label: '10h' },
  { value: 11, label: '11h' },
  { value: 12, label: '12h' },
  { value: 13, label: '13h' },
  { value: 14, label: '14h' },
  { value: 15, label: '15h' },
  { value: 16, label: '16h' },
  { value: 17, label: '17h' },
  { value: 18, label: '18h' },
  { value: 19, label: '19h' },
  { value: 20, label: '20h' },
  { value: 21, label: '21h' },
  { value: 22, label: '22h' },
  { value: 23, label: '23h' },
];
const optionsJours = [
  { value: 1, label: 'LUNDI' },
  { value: 2, label: 'MARDI' },
  { value: 3, label: 'MERCREDI' },
  { value: 4, label: 'JEUDI' },
  { value: 5, label: 'VENDREDI' },
  { value: 6, label: 'SAMEDI' },
  { value: 7, label: 'DIMANCHE' },

];


module.exports = {
  fields: {
    type: {
      type: Types.Select,
      options: 'HORAIRE_MATIN, HORAIRE_SOIR, HORAIRE_SAMEDI, HORAIRE_DIMANCHE',
    },
    jour: {
      type: Types.Select,
      options: optionsJours,
      dataType: 'integer',
    },
    tousLesJoursOuvrables: {
      type: Types.Checkbox
    },
    debut: {
      type: Types.Select,
      options: optionsHoraires,
      dataType: 'integer',
      isRequired: true
    },
    fin: {
      type: Types.Select,
      options: optionsHoraires,
      dataType: 'integer',
      isRequired: true
    },
    majorationEnPourcentage: {
      type: Types.Integer,
      isRequired: true
    },
    services: {
      type: Types.Relationship,
      ref: "Service.majorations",
      many: true
    }
  },
  labelField: 'type',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  }
};