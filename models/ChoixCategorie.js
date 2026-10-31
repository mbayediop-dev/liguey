const access = require('../services/acl');
const Types = require('@keystonejs/fields');
const options= [1,2,3,4,5,6,7,8,9,10];

module.exports = {

    fields: {
        titre: {
            type: Types.Text,
            isRequired: true
        },
        numeroChoix: {
            type: Types.Integer,
        },
        nombreMinimum: {
            type:Types.Integer,
        },
        nombreMaximum: {
            type:Types.Integer,
        },
        categorie: {
            type: Types.Relationship,
            ref: "CategorieService.choix",
            many: false
        },
        tarif:{
            type: Types.Relationship,
            ref: "Tarif.choix",
            many: false
        }
    },
    labelField: "titre",
    access:
    {
        read: true, //access.userIsAdminOrOwner,
        update: access.userIsAdminOrOwner,
        create: access.userIsAdmin,
        delete: access.userIsAdmin,
        auth: true,
    },
}