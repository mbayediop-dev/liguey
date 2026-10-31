const access = require('../services/acl');
const Types = require('@keystonejs/fields');
const fileAdapter = require('../services/fileAdapter');
const date = new Date();
module.exports = {

    fields: {
        urlSite: {
            type: Types.Text,
            isRequired: true
        },
        tauxTVA1EnPourcentage: {
            type: Types.Float,
            isRequired: true
        },
        tauxTVA2EnPourcentage: {
            type: Types.Float,
            isRequired: true
        },
        fraisAdministratifEnPourcentage: {
            type: Types.Float,
            isRequired: true
        },
        pourcentageHeroes: {
            type: Types.Float,
            isRequired: true
        },
        mailAdministrateur: {
            type: Types.Text,
            isRequired: true
        },
        adresse: {
            type: Types.Relationship,
            ref: "Adresse",
        },
        identifiantEntreprise: {
            type: Types.Text,
            isRequired: true
        },
        prefixeNumeroFactureHeroesClient: {
            type: Types.Text,
            defaultValue: "HER-CLIENT-"
        },
        prefixeNumeroFacturePrestataireClient: {
            type: Types.Text,
            defaultValue: "PREST-CLIENT-"
        },
        numeroSeriesFactureClient: {
            type: Types.Text,
            defaultValue: '000000'
        },
        cguFile: {
            type: Types.File,
            adapter: fileAdapter,
            hooks: {
                beforeChange: async ({ existingItem }) => {
                    if (existingItem && existingItem.file) {
                        await fileAdapter.delete(existingItem.file);
                    }
                },
            }
        },
        dateEnregistrement: {
            type: Types.DateTime,
            default: date.toDateString()
        }
    },
    labelField: "urlSite",
    access:
    {
        read: true, //access.userIsAdminOrOwner,
        update: true,
        create: true,
        delete: true,
        auth: true,
    },
}