const Types = require('@keystonejs/fields');
const fileAdapter = require("../services/fileAdapter");
const access = require("../services/acl");
const { CreateCustomer, CreateConnectedAccount, CreateConnectedAccountTypeExpress } = require('../extends/Stripe');
const { CREATETOKEN } = require('../extends/createToken');
const { SENDKYCADMIN, SENDMAILADMINNOVALIDATE, SENDMAILSTRIPENOVALIDATE, SENDMAILSTRIPEVALIDATE } = require('../extends/SendMail');
const { CreateContactInBexio } = require('../extends/Bexio');

module.exports = {
  fields: {
    nom: {
      type: Types.Text,
      isRequired: true
    },
    prenom: {
      type: Types.Text,
      isRequired: true
    },
    email: {
      type: Types.Text,
      isUnique: true,
    },
    isAdmin: {
      type: Types.Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdminOrOwner,
      },
    },
    deleted: {
      type: Types.Checkbox,
      defaultValue: false,

    },
    password: {
      type: Types.Password,
    },
    etat: {
      type: Types.Select,
      options: 'INACTIF, ACTIF, ADMIN_VALIDATE, ADMIN_NO_VALIDATE, STRIPE_VALIDATE, STRIPE_NO_VALIDATE',
      isRequire: true,
      defaultValue: 'INACTIF'
    },
    facebookId: {
      type: Types.Text
    },
    typeIdentite: {
      type: Types.Text
    },
    typeRegistreCommerce: {
      type: Types.Text
    },
    raisonSocial: {
      type: Types.Text
    },
    nomSociete: {
      type: Types.Text
    },
    typePrestataire: {
      type: Types.Select,
      options: 'Particulier, Professionnel',
    },
    changementAdresse: {
      type: Types.Select,
      options: 'En_cours, Valider',
    },
    createdAt: {
      type: Types.DateTime
    },
    updatedAt: {
      type: Types.DateTime
    },
    photo: {
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
    birthDate: {
      type: Types.CalendarDay
    },
    postcode: {
      type: Types.Integer
    },
    street: {
      type: Types.Text
    },
    city: {
      type: Types.Text
    },
    country: {
      type: Types.Text
    },
    number: {
      type: Types.Integer
    },
    phone: {
      type: Types.Text
    },

    formated_adress: {
      type: Types.Text
    },
    fingerprintToken: {
      type: Types.Text
    },
    tokenForgotPassword: {
      type: Types.Text
    },
    expireAtCodeForgotPassword: {
      type: Types.DateTime,
    },
    userStripeId: {
      type: Types.Text
    },
    paiementDefault: {
      type: Types.Text
    },
    proStripeId: {
      type: Types.Text
    },
    urlPro: {
      type: Types.Text
    },
    IBAN: {
      type: Types.Text
    },
    emailConfirmed:{
      type: Types.Checkbox,
      defaultValue: false
    },
    mailConfirmationReceiver:{
      type: Types.Checkbox,
      defaultValue: false
    },
    mailStripeReceiver:{
      type: Types.Checkbox,
      defaultValue: false
    },
    contactIdBexio: {
      type: Types.Integer
    },
    contactRefBexio: {
      type: Types.Text
    },
    accountIdBexio: {
      type: Types.Integer
    },
    noteMoyenne: {
      type: Types.Float,
      defaultValue: 0.00
    },
    prefixeNumeroFactureADestinationClient: {
      type: Types.Text,
      defaultValue: "HER-CLIENT-"
    },
    numeroSeriesFactureClient: {
      type: Types.Text,
      default: '000000'
    },
    pieceId: {
      type: Types.Text
    },
    newsletters: {
      type: Types.Checkbox,
      defaultValue: false
    },
    soumisALaTVA: {
      type: Types.Checkbox,
      defaultValue: false
    },
    rayon: {
      type: Types.Float,
      defaultValue: 0.00
    },
    adresse:{
     type: Types.Relationship,
     ref: "Adresse",
     many: false
    },
    roles: {
      type: Types.Relationship,
      ref: "Role.utilisateurs",
      many: true
    },
    services: {
      type: Types.Relationship,
      ref: "Service.utilisateurs",
      many: true
    },
    prestationPrestataires: {
      type: Types.Relationship,
      ref: "Prestation.prestataire",
      many: true
    },
    prestationMandataires: {
      type: Types.Relationship,
      ref: "Prestation.mandataire",
      many: true
    },
    pieceJointes: {
      type: Types.Relationship,
      ref: "PieceJointe.utilisateur",
      many: true
    },
    messageEmis: {
      type: Types.Relationship,
      ref: "Message.creerPar",
      many: true
    },
    messageRecus: {
      type: Types.Relationship,
      ref: "Message.destination",
      many: true
    },
    demandeChangementHoraires: {
      type: Types.Relationship,
      ref: "DemandeChangementHoraire.prestataire",
      many: true
    },
    acceptationPrestations: {
      type: Types.Relationship,
      ref: "AcceptationPrestation.prestataire",
      many: true
    },
    demandeServices: {
      type: Types.Relationship,
      ref: "DemandeService.prestataire",
      many: true
    },
    avis: {
      type: Types.Relationship,
      ref: 'Avi.utilisateur',
      many: true
    },
    userAppleId: {
      type: Types.Text
    },
    identityAppleToken: {
      type: Types.Text
    },
    pushTokens: {
      type: Types.Relationship,
      ref: 'PushToken.utilisateur',
      many: true
    }
  },
  labelField: 'email',
  // List-level access controls
  access: {
    read: true, // access.userIsAdminOrOwner,
    update: true, //access.userIsAdminOrOwner,
    create: true, //access.userIsAdmin,
    delete: true,
    auth: true
  },
  hooks: {
    afterChange: async (data) => {
      const keyst = data.context;

      const {
        data: { User: { id, roles, pieceJointes, services } }
      } = await keyst.executeGraphQL({
        context: keyst.createContext({ skipAccessControl: true }),
        query: `query {
              User(
                where: {
                  id: "${data.updatedItem.id}"
                }
              ) {
                  id
                  roles {
                    id
                    nom
                  }
                  services {
                    id
                    titre
                    description
                  }
                  pieceJointes (
                    where: {
                      type_in: [PIECE_IDENTITE, REGISTRE_COMMERCE]
                    }
                  ) {
                      id
                      type
                      PJ {
                        id
                        filename
                        mimetype
                      }
                  }
              }
            }`,
      });

      if (roles.find(e => e.nom === 'PRESTATAIRE') && !data.existingItem.proStripeId && (data.existingItem.etat === 'ACTIF' || data.existingItem.etat === 'INACTIF')) {
        if (services && services.length > 0) {
          services.forEach(async service => {
            const {
              errors,
              data: { createDemandeService }
            } = await keyst.executeGraphQL({
              context: keyst.createContext({ skipAccessControl: true }),
              query: `
                mutation {
                  createDemandeService(
                    data: {
                      service: {
                        connect: {
                          id: "${service.id}"
                        }
                      }
                      prestataire: {
                        connect: {
                          id: "${id}"
                        }
                      }
                    }
                  )
                  {
                    id
                  }
                }`,
            });

            if (errors) {
              return errors;
            }
          });

          const {
            errors,
            data: { updateUser }
          } = await keyst.executeGraphQL({
            context: keyst.createContext({ skipAccessControl: true }),
            query: `
              mutation {
                updateUser(
                  id: "${id}"
                  data: {
                    services: {
                      disconnectAll: true
                    }
                  }
                )
                {
                  id
                }
              }`,
          });

        }
      }
      if (data.operation === 'create') {
        if (roles.find(e => e.nom === 'MANDATAIRE')) {
          if (data.updatedItem.facebookId)
            await CreateCustomer(keyst, data.updatedItem);
         await CREATETOKEN(keyst, data.updatedItem, true);
         const name = data.updatedItem.prenom + " " + data.updatedItem.nom;
         await CreateContactInBexio(name, data.updatedItem.email, data.updatedItem.street, data.updatedItem.postcode, data.updatedItem.city, data.updatedItem.phone, data.updatedItem.id, data.context)
        } else {
          await CREATETOKEN(keyst, data.updatedItem, false);
        }
      };

      if (data.operation === 'update') {
        if (roles.find(e => e.nom === 'PRESTATAIRE') && !data.existingItem.proStripeId && (data.updatedItem.etat !== 'INACTIF' && data.updatedItem.etat !== 'ADMIN_NO_VALIDATE' && data.updatedItem.etat !== 'ADMIN_VALIDATE') && (data.updatedItem.etat === 'ACTIF')) {
          await SENDKYCADMIN(keyst, data.updatedItem.id);
        }
        if (roles.find(e => e.nom === 'MANDATAIRE') && !data.existingItem.userStripeId && !data.updatedItem.facebookId && (data.updatedItem.etat !== 'INACTIF')) {
          await CreateCustomer(keyst, data.updatedItem);
        }
        if (roles.find(e => e.nom === 'PRESTATAIRE') && !data.existingItem.proStripeId && (data.existingItem.etat === 'ACTIF' || data.existingItem.etat === 'ADMIN_NO_VALIDATE' || data.existingItem.etat === 'INACTIF') && data.updatedItem.etat === 'ADMIN_VALIDATE') {
          await  CreateConnectedAccount(keyst, data.updatedItem, pieceJointes);
        }
        if (roles.find(e => e.nom === 'PRESTATAIRE') && !data.existingItem.proStripeId && data.existingItem.etat === 'ACTIF' && data.updatedItem.etat === 'ADMIN_NO_VALIDATE') {
          await SENDMAILADMINNOVALIDATE(data.updatedItem);
        }
        if (roles.find(e => e.nom === 'PRESTATAIRE') && data.existingItem.etat === 'ADMIN_VALIDATE' && data.updatedItem.etat === 'STRIPE_VALIDATE') {
          await SENDMAILSTRIPEVALIDATE(data.updatedItem);
        }
        if (roles.find(e => e.nom === 'PRESTATAIRE') && data.existingItem.etat === 'ADMIN_VALIDATE' && data.updatedItem.etat === 'STRIPE_NO_VALIDATE') {
          await SENDMAILSTRIPENOVALIDATE(data.updatedItem);
        }
      }

    },
  }
};
