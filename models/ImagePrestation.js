const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");

module.exports = {
    fields: {
        nom: {
            type: Types.Text,
            isRequired: true
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
    labelField: 'nom',
    access: {
        read: true, 
        update: true,
        create: true,
        delete: true,
        auth: true,
    }
};