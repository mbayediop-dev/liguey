const Types = require('@keystonejs/fields');
const access = require('../services/acl');

module.exports = {
fields: {
    titre: {
        type: Types.Text,
        isRequired : true
    },
    contenu :{
        type: Types.Text,
        isRequired :true,
        isMultiline : true
    },
    type:{
        type: Types.Select,
        isRequired: true,
        options: ["prestataire", "mandataire"]
    },
    categories:{
        type: Types.Relationship,
        many: true,
        ref : "CategorieService.conditions",
        isRequired: true
    },
    ordre: {
        type: Types.Integer,
    },
    services:{
        type: Types.Relationship,
        many: true,
        ref : "Service.conditions",
        isRequired: true
    }

},
labelField:"titre",
access: {
    read: true, //access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
}


