const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    date: {
        type: Types.DateTime
    },
    heure: {
        type: Types.Text
    },
    prestation: {
        type: Types.Relationship,
        ref: "Prestation.acceptationPrestations",
        many: false
    },
    prestataire: {
        type: Types.Relationship,
        ref: "User.acceptationPrestations",
        many: false
    },
    statut: {
        type: Types.Select,
        options: 'EN_COURS, ACCEPTER, REJETER',
        defaultValue: 'EN_COURS'
    }
  },
  labelField: 'statut',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: access.userIsAdmin,
    auth: true,
  },
  hooks: {
    beforeChange: async (dataIput) => {
      const {
        data: { updatePrestation }
      } = await dataIput.context.executeGraphQL({
        context: dataIput.context.createContext({ skipAccessControl: true }),
        query: `
          mutation {
            updatePrestation (
              id: "${dataIput.resolvedData.prestation}"
              data: {
                statut: Accepte
              }
            ) {
              id
            }
          }  
        `,
      });
    }
  }
};