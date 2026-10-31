const Types = require('@keystonejs/fields');
const access = require("../services/acl");

const options = [
  { value: 24, label: '0h' },
  { value: 1,  label: '1h' },
  { value: 2,  label: '2h' },
  { value: 3,  label: '3h' },
  { value: 4,  label: '4h' },
  { value: 5,  label: '5h' },
  { value: 6,  label: '6h' },
  { value: 7,  label: '7h' },
  { value: 8,  label: '8h' },
  { value: 9,  label: '9h' },
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
const optionsParJour =[
  { value: 24, label: '1/2 journée' },
  { value: 1, label: '1 journée' },
  { value: 2, label: '2 journées' },
  { value: 3, label: '3 journées' },
  { value: 4, label: '4 journées' },
  { value: 5, label: '5 journées' },
  { value: 6, label: '6 journées' },
  { value: 7, label: '1 semaine' },
]
module.exports = {
  fields: {
    heureDebut: {
      type: Types.Select,
      options: options,
      dataType: 'integer',
      isRequired: true
    },
    heureFin: {
      type: Types.Select,
      options: options,
      dataType: 'integer',
      isRequired: true
    },
    heureLimitExerceMission: {
      type: Types.Select,
      options: options,
      dataType: 'integer',
      defaultValue:24,
      isRequired: true
    },
    dureeMaximum: {
      type: Types.Select,
      options: options,
      dataType: 'integer',
    },
    dureeMinimum: {
      type: Types.Select,
      options: options,
      dataType: 'integer',
    },
    dureeMaximumParJour: {
      type: Types.Select,
      options: optionsParJour,
      dataType: 'integer',
    },
    dureeMinimumParJour: {
      type: Types.Select,
      options: optionsParJour,
      dataType: 'integer',
    },
   
    distanceMinimum: {
      type: Types.Float,
    },
    distanceMaximum: {
      type: Types.Float,
    },
    nombreObjet: {
      type: Types.Integer,
    },
    tousLesJours: {
      type: Types.Checkbox,
      defaultValue: true
    },
    categorieServices: {
      type: Types.Relationship,
      ref: "CategorieService.horaire",
      many: true
    },
    joursDisponibles: {
      type: Types.Relationship,
      ref: "JourSemaine.horaires",
      many: true
    }
  },
  labelResolver: item => `${item.heureDebut}-${item.heureFin}`,
  access: {
    read:   true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth:   true,
  }
};