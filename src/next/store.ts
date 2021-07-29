import generalSchema from "../framework/graphql/generalSchema";

export default {
  graphql: {
    typeDefs: `
        ${generalSchema}
        type Response {
          message: String
          version: String
        }
        type Query {
          version: String
        }
        type Mutation {
          version: String
        }
        schema {
          query: Query
          mutation: Mutation
        }
    `,
    resolvers: {
      Query: {
        version: () => require("../../package.json").version,
      },
      Mutation: {
        version: () => require("../../package.json").version,
      },
    },
  },
  database: {
    relationships: [],
  },
};
