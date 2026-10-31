const Types = require('@keystonejs/fields');
const access = require('../services/acl');
const options= [1,2,3,4,5,6,7,8,9,10];
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
        service: {
            type: Types.Relationship,
            ref: "Service.categories",
            many: false,
            isRequired: true
        },
        choixUnique: {
            type: Types.Checkbox,
            defaultValue: false
        },
        choix: {
            type: Types.Relationship,
            many: true,
            ref: "ChoixCategorie.categorie"
        },
        conditions: {
            type: Types.Relationship,
            many: true,
            ref: "ConditionCategorie.categories"
        },
        horaire: {
            type: Types.Relationship,
            ref: "Horaire.categorieServices",
            many: false
        },

    },
    labelField: 'nom',
    access: {
        read: true,
        update: access.userIsAdmin,
        create: access.userIsAdmin,
        delete: access.userIsAdmin, // access.userIsAdmin,
        auth: true,
    }
}