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
      roles: a.string().array().default(['user']),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.groups(['admins']),
    ]),

  // Ejemplo de otra entidad relacionada
  UserProfile: a
    .model({
      userId: a.id().required(),
      bio: a.string(),
      website: a.url(),
      location: a.string(),
      user: a.belongsTo('User', 'userId'),
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
    // Opcional: mantener API key para desarrollo
    apiKeyAuthorizationMode: {
      expiresInDays: 7,
    },
  },
});