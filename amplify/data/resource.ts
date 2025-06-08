import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
   User: a.model({
    email: a.email().required(),
    username: a.string().required(),
    password: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    status: a.string().default('active'),
    lastLogin: a.datetime() // Añade este campo
  })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.groups(['admins'])
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool"
  }
});