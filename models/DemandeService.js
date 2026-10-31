const Types = require('@keystonejs/fields');
const access = require("../services/acl");
const { SENDMAIDEMANDENOUVEAUSERVICE } = require('../extends/SendMail');

module.exports = {
  fields: {
    service: {
        type: Types.Relationship,
        ref: "Service.demandeServices",
        many: false
    },
    prestataire: {
        type: Types.Relationship,
        ref: "User.demandeServices",
        many: false
    }
  },
  labelField: 'statut',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  },
  hooks: {
    afterChange: async (data) => {
      if (data.operation === 'create') {
        const {
          data: { DemandeService }
        } = await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
            query {
              DemandeService(
                where: {
                  id: "${data.updatedItem && data.updatedItem.id ? data.updatedItem.id : ''}"
                }
              ) {
                id
                prestataire {
                  id
                  prenom
                  nom
                  email
                }
                service {
                  id
                  titre
                }
              }
            }
          `,
        });

        if (DemandeService && DemandeService.prestataire) {
          SENDMAIDEMANDENOUVEAUSERVICE(DemandeService)
        }
      }

    }
  }
};