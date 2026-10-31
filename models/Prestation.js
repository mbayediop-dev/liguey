const Types = require('@keystonejs/fields');
const access = require("../services/acl");
const date = new Date();
const { CreatePaymentWithDefaulCard } = require('../extends/Stripe');
const { CalculTarifPrestation } = require('../extends/CalculTarifPrestation');
const { calculNoteMoyennePrestataire } = require('../extends/CalculNoteMoyennePrestataire');
var statusPayment = 'requires_payment_method, requires_confirmation, requires_source, requires_action, processing, requires_capture, canceled, succeeded, failed_connection, not_totality, no_pay, requires_source_action, pending, failed, waiting_for_payment';
var statusPrestaion = 'En_Attente, Accepte, En_cours, Annule, Termine, Valide, Demarrer, Demarrage_Confirme, Demarrage_Conteste, Termine_Confirme';
const optionsCurrency = ["CHF", "EUR", "USD", "XOF"]
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
    dateMomentCommande: {
      type: Types.DateTime,
      isRequired: true,

    },
    dateDeLaPrestation: {
      type: Types.DateTime,
      isRequired: true,
    },
    heurePrestation: {
      type: Types.Text,
      isRequired: true
    },
    heureMomentCommande: {
      type: Types.Text,
      isRequired: true
    },
    heureDemarrage: {
      type: Types.Text,
    },
    heureFin: {
      type: Types.Text,
    },
    dureeDeLaPrestation: {
      type: Types.Text,
    },
    dureeReelleDeLaPrestation: {
      type: Types.Text,
    },
    distanceParKm: {
      type: Types.Float,
    },
    prixDeBase: {
      type: Types.Float,
      defaultValue: 0.00
    },
    totalFacturer: {
      type: Types.Float,
      defaultValue: 0.00
    },
    currency: {
      type: Types.Select,
      options: optionsCurrency,
      defaultValue: "CHF"
    },
    adresseDestination: {
      type: Types.Relationship,
      ref: "AdressePrestation",
      many: false
    },
    reversePrestataire: {
      type: Types.Float,
      defaultValue: 0.00
    },
    typeStatusPayment: {
      type: Types.Select,
      options: statusPayment,
      defaultValue: 'no_pay'
    },
    paymentSource: {
      type: Types.Text,
    },
    chargeId: {
      type: Types.Text,
    },
    mfHonoraireHeroes:{
      type: Types.Float,
      defaultValue: 0.00
    },
    mfReversePrestataire:{
      type: Types.Float,
      defaultValue: 0.00
    },
    statut: {
      type: Types.Select,
      options: statusPrestaion,
      defaultValue: 'En_Attente'
    },
    isValidateByMandataire: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isCancelBySysteme: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isPosted: {
      type: Types.Checkbox,
      defaultValue: false
    },
    cardSource: {
      type: Types.Text
    },
    referencePrestation: {
      type: Types.Text
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
    motantPenalite: {
      type: Types.Float
    },
    notation: {
      type: Types.Integer
    },
    isNotify15min: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isNotify5min: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isNotify15minFinMission: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isNotify5minFinMission: {
      type: Types.Checkbox,
      defaultValue: false
    },
    isNotify1Heure: {
      type: Types.Checkbox,
      defaultValue: false
    },
    paymentIntentClientSecret: {
      type: Types.Text,
    },
    paymentIntentReturnUrl: {
      type: Types.Text,
    },
    generateFactureHeroesClient: {
      type: Types.Checkbox,
      defaultValue: false
    },
    generateFactureHeroesPrestataire: {
      type: Types.Checkbox,
      defaultValue: false
    },
    adresse: {
      type: Types.Relationship,
      isRequired: true,
      ref: "AdressePrestation",
      many: false
    },
    service: {
      type: Types.Relationship,
      ref: "Service",
      many: false,
    },
    choix: {
      type: Types.Relationship,
      ref: "ChoixCategorie",
      many: false
    },
    mandataire: {
      type: Types.Relationship,
      ref: "User.prestationMandataires",
      many: false
    },
    prestataire: {
      type: Types.Relationship,
      ref: "User.prestationPrestataires",
      many: false
    },
    dateAnnulation: {
      type: Types.DateTime,
    },
    images: {
      type: Types.Relationship,
      ref: "ImagePrestation",
      many: true
    },
    itemsChoisis: {
      type: Types.Relationship,
      ref: "ItemsPrestation",
      many: true
    },
    commentaires: {
      type: Types.Relationship,
      ref: "CommentairePrestation.prestation",
      many: true
    },
    sections: {
      type: Types.Relationship,
      ref: "Section.prestation",
      many: true
    },
    demandeChangementHoraires: {
      type: Types.Relationship,
      ref: "DemandeChangementHoraire.prestation",
      many: true
    },
    mandataireDemandeChangementHoraire: {
      type: Types.Relationship,
      ref: "MandataireDemandeChangementHoraire",
    },
    acceptationPrestations: {
      type: Types.Relationship,
      ref: "AcceptationPrestation.prestation",
      many: true
    },
    fraisMateriels: {
      type: Types.Relationship,
      ref: "FraisMateriel.prestation",
      many: true
    },
    fraisTemps: {
      type: Types.Relationship,
      ref: "FraisTemp.prestation",
      many: true
    },
    facturePrestataire: {
      type: Types.Text
    },
    factureMandataire: {
      type: Types.Text
    },
    factureHeroes: {
      type: Types.Text
    },
    messages: {
      type: Types.Relationship,
      ref: "Message.prestation",
      many: true
    },
    factures: {
      type: Types.Relationship,
      many: true,
      ref: "Facture.prestation"
    }
  },
  labelField: 'titre',
  access: {
    read: true, //access.userIsAdminOrOwner,
    update: true,
    create: true,
    delete: true,
    auth: true,
  },
  hooks: {
    afterChange: async (data) => {
      const keyst = data.context;
      if (data.operation === 'create') {
        if (data.updatedItem.adresseDestination) {
          await data.context.executeGraphQL({
            context: data.context.createContext({ skipAccessControl: true }),
            query: `
                  mutation {
                    SetDistantePrestation(
                      missionId: "${data.updatedItem.id}"
                    )
                  }
                `,
          });
          await CalculTarifPrestation(keyst, data.updatedItem, "TARIF_INITIAL");
        } else {
          await CalculTarifPrestation(keyst, data.updatedItem, "TARIF_INITIAL");
        }
      }
      if (data.operation === 'update' && data.existingItem.statut === "Demarrer" && data.updatedItem.statut === "Demarrage_Conteste") {
        await data.context.executeGraphQL({
          context: data.context.createContext({ skipAccessControl: true }),
          query: `
                mutation {
                  setContestationDemarrage(
                    missionId: "${data.updatedItem.id}"
                  )
                }
              `,
        });
      }
      if (data.operation === 'update' && data.existingItem.statut === "Termine_Confirme" && data.updatedItem.notation > 0) {
        await calculNoteMoyennePrestataire(data.existingItem.prestataire, keyst);
      }
      if (data.operation === 'update' && data.existingItem.statut === "Termine" && data.updatedItem.statut === "Termine_Confirme") {
        if (!data.existingItem.generateFactureHeroesClient) {
          setTimeout(async () => {
            const {
              data: facturehc,
              errors
            } = await data.context.executeGraphQL({
              context: data.context.createContext({ skipAccessControl: true }),
              query: `
                            mutation {
                              setFactureHeroesClient(
                                missionId: "${data.existingItem.id}"
                              )
                            }
                          `,
            });
            if (facturehc) {
              await data.context.executeGraphQL({
                context: data.context.createContext({ skipAccessControl: true }),
                query: `
                          mutation {
                            setFacturePrestataireClient(
                              missionId: "${data.existingItem.id}"
                            )
                          }
                        `,
              });
            }
          }, 5000);

        }
      }
      if (data.operation === 'update' && data.existingItem.statut === "En_cours" && data.updatedItem.statut === "Annule") {
        if (data.updatedItem.isCancelBySysteme == false && data.existingItem.isCancelBySysteme == false) {
          setTimeout(async () => {
            const {
              data: facturehc,
              errors
            } = await data.context.executeGraphQL({
              context: data.context.createContext({ skipAccessControl: true }),
              query: `
                            mutation {
                              setFactureHeroesClient(
                                missionId: "${data.existingItem.id}"
                              )
                            }
                          `,
            });
            if (facturehc) {
              await data.context.executeGraphQL({
                context: data.context.createContext({ skipAccessControl: true }),
                query: `
                                mutation {
                                  setFacturePrestataireClientAnnulation(
                                    missionId: "${data.existingItem.id}"
                                  )
                                }
                              `,
              });
            }
          }, 5000);

        }
      }
    }
  }
};
