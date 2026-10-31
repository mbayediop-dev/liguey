const access = require('../services/acl');
const Types = require('@keystonejs/fields');

module.exports = {

    fields: {
        nom: {
            type: Types.Text,
            isRequired: true
        },
        choix: {
            type: Types.Relationship,
            ref: "ChoixCategorie",
            many: false
        },
        nombreItems: {
            type:Types.Integer,
        },
    },
    labelField: "nom",
    access:
    {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: true,
    },
}