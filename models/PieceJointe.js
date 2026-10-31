const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");

module.exports = {
  fields: {
    type: {
        type: Types.Select,
        options: 'PROFIL, clear, REGISTRE_COMMERCE, PIECE_IDENTITE, EXPERIENCE, CV, CFC, F_A_K, FA, PRESTATION',
        isRequired: true
    },
    filename: {
    type: Types.Text
    },
    typeCompte:{
      type: Types.Select,
      isRequired: true,
      options: ["prestataire", "mandataire"]
    },
    PJ: {
      type: Types.File,
      adapter: fileAdapter,
      // hooks: {
      //   beforeChange: async ({ existingItem }) => {
      //     if (existingItem && existingItem.file) {
      //       await fileAdapter.delete(existingItem.file);
      //     }
      //   },
      // }
    },
    utilisateur: {
        type: Types.Relationship,
        ref: "User.pieceJointes",
        many: false
    } 
  },
  labelField: 'type',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  }
};