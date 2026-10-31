const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");
const typeFacture = [ "HEROES_CLIENT_NDF", "PRESTATAIRE_CLIENT_NDF","PRESTATAIRE_CLIENT_ANNULATION","HEROES_CLIENT_ANNULATION", "HEROES_CLIENT", "PRESTATAIRE_CLIENT", "HEROES_CLIENT_TEMP_SUP", "PRESTATAIRE_CLIENT_TEMP_SUP"]

module.exports = {
  fields: {
    numeroFacture: {
      type: Types.Text,
      isRequired: true
    },
    typeFacture:{
       type: Types.Select,
       isRequired: true,
       options: typeFacture
    },
    prestation: {
      type: Types.Relationship,
      ref: "Prestation.factures",
      many: false
    },
    dateCreation:{
      type: Types.DateTime,
      isRequired: true
    },
    fileName:{
      type: Types.Text
    },
    commissionHeroes:{
      type: Types.Float
    },
    numeroSerie:{
      type: Types.Text,
     defaultValue: '000000'
    },
    montant:{
      type: Types.Float
    },
    image: {
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
  },
  labelField: 'numeroFacture',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  },

};