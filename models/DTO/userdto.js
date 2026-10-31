const User = require('../User')
const ItemUser = {
    type: 'type ItemUser { email: String!, nom: String! , token: String!, prenom: String! , userStripeId: String! }',
  
}

const USERDTOAUTH = {
    type: 'type userDTOAuth { status: Int!, message: String!, etat: String! ,token: String!, user: ItemUser }',
}

const authenticateUserOutput= {
 type:' authenticateUserOutput { token: String, item: User   }'
   
}
module.exports = {
    USERDTOAUTH,
    ItemUser,
    authenticateUserOutput
}
