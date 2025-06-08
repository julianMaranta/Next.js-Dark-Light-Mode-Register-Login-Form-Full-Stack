import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a.model({
    username: a.string().required(),
    email: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    password: a.string().required(),
    lastLogin: a.datetime()
  })
  .authorization(allow => [
    allow.publicApiKey().to(['read', 'create', 'update'])
  ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
});