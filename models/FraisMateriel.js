const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");
const optionsStatut = ["EN_COURS", "VALIDER", "CONTESTER", "REFUSER"];
var statusPayment = 'requires_payment_method, requires_confirmation, requires_source, requires_action, processing, requires_capture, canceled, succeeded, failed_connection, not_totality, no_pay, requires_source_action, pending, failed, waiting_for_payment';

module.exports = {
  fields: {
    description: {
      type: Types.Text,
      isMultiline: true
    },
    prestation: {
      type: Types.Relationship,
      ref: "Prestation.fraisMateriels",
      many: false
    },
    prix: {
      type: Types.Float,
      defaultValue: 0.0
    },
    fraisAdministratif: {
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
    TVA: {
      type: Types.Float,
      defaultValue: 0.0
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
    validateAfterMissionInProgress: {
      type: Types.Checkbox,
      default: false
    },
    validateAfterMissionTermine: {
      type: Types.Checkbox,
      default: false
    },
    statut: {
      type: Types.Select,
      options: optionsStatut,
      defaultValue: "EN_COURS"
    },
    ticketFactures: {
      type: Types.Relationship,
      ref: "TicketFacture.fraisMateriel",
      many: true
    }
  },
  labelField: 'description',
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
        console.log("hooks appelé ****")
        await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
              mutation {
                setContestationNDF(
                  missionId: "${data.updatedItem.prestation}"
                  materielId: "${data.updatedItem.id}"
                )
              }
            `,
        });

      }
      if (data.operation === 'create' && data.updatedItem.id) {
        const fraisAdministratif = data.updatedItem.prix * 0.035;
        await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
                mutation {
                  updateFraisMateriel(
                    id: "${data.updatedItem.id}" 
                    data:{
                      fraisAdministratif: ${fraisAdministratif}
                    }
                ){
                  id
                }
              }
              `,
        });
      }

      if (data.operation === 'update' && data.existingItem.statut === "EN_COURS" && data.updatedItem.statut === "VALIDER") {
        if (data.updatedItem.validateAfterMissionTermine) {
          setTimeout(async () => {
            const { data: factureFrais, error } = await data.context.executeGraphQL({
              context: data.context.createContext({ skipAccessControl: true }),
              query: `
                  mutation{
                      setFactureHeroesClientNDF(missionId:"${data.existingItem.prestation}",idFraisMateriel:"${data.existingItem.id}")
                  }
                  `
            })
            if (error) {
              console.log("error", error)
            }
            if (factureFrais) {
              await data.context.executeGraphQL({
                context: data.context.createContext({ skipAccessControl: true }),
                query: `
                    mutation{
                        setFacturePrestataireClientNDF(missionId:"${data.existingItem.prestation}",idFraisMateriel:"${data.existingItem.id}")
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