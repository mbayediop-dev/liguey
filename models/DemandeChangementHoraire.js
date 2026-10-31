const Types = require('@keystonejs/fields');
const access = require("../services/acl");

module.exports = {
  fields: {
    nouvelleDate: {
      type: Types.DateTime
    },
    nouvelleHeure: {
      type: Types.Text
    },
    prestation: {
      type: Types.Relationship,
      ref: "Prestation.demandeChangementHoraires",
      many: false
    },
    prestataire: {
      type: Types.Relationship,
      ref: "User.demandeChangementHoraires",
      many: false
    },
    totalFacturer: {
      type: Types.Float,
      defaultValue: 0.0
    },
    reversePrestataire: {
      type: Types.Float,
      defaultValue: 0.0
    },
    typeMajoration: {
      type: Types.Text,
      defaultValue: 'HORAIRE_MATIN'
    },
    dureeMajorationInHeure: {
      type: Types.Float,
      defaultValue: 0.00
    },
    pourcentageMajoration: {
      type: Types.Integer,
      defaultValue: 0
    },
    statut: {
      type: Types.Select,
      options: 'EN_COURS, ACCEPTER, REJETER',
      defaultValue: 'EN_COURS'
    }
  },
  labelField: 'statut',
  access: {
    read: true, //access.userIsAdminOrOwner : for admin or owner,
    update: true,
    create: true,
    delete: access.userIsAdmin,
    auth: true,
  },
  hooks: {
    beforeChange: async (data) => {
      if (data.operation === 'create') {
        const {
          data: { Prestation }
        } = await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
            query {
              Prestation(
                where: {
                  id: "${data.resolvedData.prestation ? data.resolvedData.prestation : ""}"
                }
              ) {
                id
                statut
              }
            }
          `,
        });

        if (Prestation && Prestation.statut === 'En_cours') {
          await data.context.executeGraphQL({
            context: data.context.createContext({ skipAccessControl: true }),
            query: `
              mutation {
                updatePrestation(
                  id: "${data.resolvedData.prestation}"
                  data: {
                    demandeChangementHoraires: {
                      disconnectAll: true
                    }
                  }
                ) {
                  id
                  statut
                }
              }
            `,
          });
        }
      }

    }
  }
};