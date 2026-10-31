const types = require('@keystonejs/fields');
const access = require("../services/acl");

const options = ["TARIF_HORAIRE", "TARIF_DISTANT", "TARIF_FIXE", "TARIF_UNITE", "TARIF_PAR_JOUR","TARIF_BLOC_DE_TEMPS","TARIF_ANNULATION"]
const currency = ["CHF", "EUR", "USD", "XOF"]


module.exports = {
    fields: {
        type: {
            type: types.Select,
            options: options,
            isRequired: true
        },
        currency: {
            type: types.Select,
            options: currency,
            defaultValue: "CHF"
        },
        tvaInclu:{
            type: types.Checkbox,
            defaultValue: false
        },
        prixItem: {
            type: types.Float
        },
        distanceMinimumFacture:{
            type: types.Float
        },
        horaireMinimumFactureParBlocTemps:{
            type: types.Integer
        },
        prixParNombreKm: {
            type: types.Float
        },
        tarifMinimumDistant: {
            type: types.Float
        },
        prixFixeParPrestation: {
            type: types.Float
        },
        prixHoraire: {
            type: types.Float
        },
        prixParBlocDeTemps: {
            type: types.Float
        },
        prixParJour: {
            type: types.Float
        },
        choix: {
            type: types.Relationship,
            ref: "ChoixCategorie.tarif",
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
    },
};