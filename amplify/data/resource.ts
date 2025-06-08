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
      status: a.enum(['active', 'suspended', 'deleted']),
      lastLogin: a.datetime(),
      roles: a.string().array().default(['user']),
      profile: a.hasOne('UserProfile', 'userId') // Relación explícita con UserProfile
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.groups(['admins']),
    ]),

  UserProfile: a
    .model({
      userId: a.id().required(),
      bio: a.string(),
      website: a.url(),
      location: a.string(),
      user: a.belongsTo('User', 'userId'), // Relación inversa
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
    // Configuración alternativa sin expiración
    apiKeyAuthorizationMode: process.env.NODE_ENV === 'development' ? {} : undefined
  },
});