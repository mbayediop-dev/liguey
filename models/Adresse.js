const Types = require('@keystonejs/fields');
const access = require('../services/acl');

module.exports = {
    fields: {
        formattedAddress:{
            type: Types.Text,
            isRequired: true
        },
        postcode: {
            type: Types.Integer,
        },
        street: {
            type: Types.Text,
            isRequired: true
        },
        city: {
            type: Types.Text,
            isRequired: true
        },
        country: {
            type: Types.Text,
            defaultValue: "Suise"
        },
        longitude: {
            type: Types.Float,
            isRequired: true
        },
        latitude: {
            type: Types.Float,
            isRequired: true
        },
    },
    labelField: "formattedAddress",
    access: {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: true,
      }
}