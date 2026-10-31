const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");

module.exports = {
  fields: {
    type: {
        type: Types.Select,
        options: 'TEXT, AUDIO, IMAGE, DOCUMENT, VIDEO',
        isRequired: true
    },
    contenu: {
        type: Types.Text,
        isMultipled: true
    },
    duration: {
        type: Types.Text
    },
    PJ: {
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
    date: {
        type: Types.DateTime
    },
    lu: {
        type: Types.Checkbox
    },
    prestation: {
        type: Types.Relationship,
        ref: "Prestation.messages",
        many: false
    },
    creerPar: {
        type: Types.Relationship,
        ref: "User.messageEmis",
        many: false
    },
    destination: {
        type: Types.Relationship,
        ref: "User.messageRecus",
        many: false
    }
  },
  labelField: 'type',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: true, //access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
  hooks: {
    beforeChange: async (data) => {
        if (data.operation === 'create') {
            data.originalInput.date = new Date();
        }
    },
    afterChange: async (data) => {
        if (data.operation === 'create') {
            
        }
    }
  }
};