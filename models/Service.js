const Types = require('@keystonejs/fields');
const access = require("../services/acl");
const fileAdapter = require("../services/fileAdapter");

module.exports = {
  fields: {
    titre: {
      type: Types.Text,
      isRequired: true
    },
    description: {
      type: Types.Text,
      isMultiline: true
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
    categories: {
      type: Types.Relationship,
      ref: 'CategorieService.service',
      many: true
    },
    qualifications: {
      type: Types.Relationship,
      ref: "Qualification.services",
      isRequired: true,
      many: true
    },
    model: {
      type: Types.Relationship,
      ref: "ModelService.services",
      many: false
    },
    utilisateurs: {
      type: Types.Relationship,
      ref: "User.services",
      many: true
    },
    penalites: {
      type: Types.Relationship,
      ref: "Penalite.services",
      many: true
    },
    majorations: {
      type: Types.Relationship,
      ref: "Majoration.services",
      many: true
    },
    demandeServices: {
      type: Types.Relationship,
      ref: "DemandeService.service",
      many: true
    },
    conditions: {
      type: Types.Relationship,
      many: true,
      ref: "ConditionCategorie.services"
    },
  },
  labelField: 'titre',
  access: {
    read: true, // access.userIsAdminOrOwner,
    update: true, // access.userIsAdminOrOwner,
    create: true, // access.userIsAdmin,
    delete: true, // access.userIsAdmin,
    auth: true,
  },
};