const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");
const optionsStatut = ["EN_COURS", "VALIDER", "CONTESTER", "REFUSER"]
var statusPayment = 'requires_payment_method, requires_confirmation, requires_source, requires_action, processing, requires_capture, canceled, succeeded, failed_connection, not_totality, no_pay, requires_source_action, pending, failed, waiting_for_payment';

module.exports = {
  fields: {
    heure: {
      type: Types.Integer
    },
    minute: {
      type: Types.Integer
    },
    prix: {
      type: Types.Float,
      defaultValue: 0.0
    },
    reversePrestataire: {
      type: Types.Float,
      defaultValue: 0.0
    },
    mfHonoraireHeroes:{
      type: Types.Float,
      defaultValue: 0.00
    },
    mfReversePrestataire:{
      type: Types.Float,
      defaultValue: 0.00
    },
    isGenerateFacturePrestataire: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isGenerateFactureMandataire: {
      type: Types.Checkbox,
      defaultValue: false
    },
    typeStatusPayment: {
      type: Types.Select,
      options: statusPayment,
      defaultValue: 'no_pay'
    },
    prestation: {
      type: Types.Relationship,
      ref: "Prestation.fraisTemps",
      many: false
    },
    validateAfterMissionInProgress: {
      type: Types.Checkbox,
      default: false
    },
    validateAfterMissionTermine: {
      type: Types.Checkbox,
      default: false
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
      options: optionsStatut,
      defaultValue: "EN_COURS"
    }
  },
  labelResolver: item => `${item.heure}h:${item.minute}`,
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  },
  hooks: {
    afterChange: async (data) => {

      if (data.operation === 'update' && data.existingItem.statut === "EN_COURS" && data.updatedItem.statut === "CONTESTER") {
        await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
              mutation {
                setContestationTempsSup(
                  missionId: "${data.updatedItem.prestation}"
                  tempsId:   "${data.updatedItem.id}"
                )
              }
            `,
        });
      }

      if (data.operation === 'update' && data.existingItem.statut === "EN_COURS" && data.updatedItem.statut === "VALIDER") {
        if (data.updatedItem.validateAfterMissionTermine) {
          setTimeout(async () => {
            const { data: facturets, error } = await data.context.executeGraphQL({
              context: data.context.createContext({ skipAccessControl: true }),
              query: `
                    mutation{
                      setFactureHeroesClientTempSupplementaire(missionId:"${data.existingItem.prestation}",idTempSup:"${data.existingItem.id}")
                    }
                    `
            })
            if (error) {
              console.log("error", error)
            }
            if (facturets) {
             await data.context.executeGraphQL({
                context: data.context.createContext({ skipAccessControl: true }),
                query: `
                      mutation{
                        setFacturePrestataireClientTempSupplementaire(missionId:"${data.existingItem.prestation}",idTempSup:"${data.existingItem.id}")
                      }
                      `
              })
            }
          }, 5000);
         

        }
      }
    }
  }
};