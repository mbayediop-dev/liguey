const access = require('../services/acl');
const Types = require('@keystonejs/fields');

module.exports = {

    fields: {
        titre: {
            type: Types.Text,
            isRequired: true
        },
        contenu: {
            type: Types.Text,
            isRequired: true,
            isMultiline: true
        },
        prestation: {
            type: Types.Relationship,
            ref: "Prestation.commentaires",
            many: false
        }
    },
    labelField: "titre",
    access:
    {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: true,
    },
}