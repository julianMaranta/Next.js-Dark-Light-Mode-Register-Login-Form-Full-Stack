import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  User: a
    .model({
      email: a.email().required(),
      username: a.string().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      birthDate: a.date(),
      profilePicture: a.url(),
      
      lastLogin: a.datetime(),
      roles: a.string().array(),
      // Relación explícita con UserProfile
      profile: a.hasOne('UserProfile', 'userId')
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.groups(['admins']),
    ]),

  UserProfile: a
    .model({
      // Campo de referencia debe coincidir exactamente
      userId: a.id().required(),
      bio: a.string(),
      website: a.url(),
      location: a.string(),
      // Relación inversa bien definida
      user: a.belongsTo('User', 'userId')
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // Configuración segura para API key
    apiKeyAuthorizationMode: process.env.NODE_ENV === 'development' ? {} : undefined
  },
});