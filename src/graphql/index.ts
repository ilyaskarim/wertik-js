import get from 'lodash.get'
import { defaultApolloGraphqlOptions } from '../borrowed/options'
import { ApolloServer } from 'apollo-server-express'
import { useGraphqlProps, GraphqlInitializeProps } from '../types/graphql'
import omit from 'lodash.omit'

export const useGraphql = (props?: useGraphqlProps) => {
  return ({
    wertikApp,
    expressApp,
    store,
    configuration,
  }: GraphqlInitializeProps) => {
    props = props != null || {}
    store.graphql.typeDefs = store.graphql.typeDefs.concat(
      get(configuration, 'graphql.typeDefs', '')
    )

    store.graphql.resolvers.Query = {
      ...store.graphql.resolvers.Query,
      ...get(configuration, 'graphql.resolvers.Query', {}),
    }

    store.graphql.resolvers.Mutation = {
      ...store.graphql.resolvers.Mutation,
      ...get(configuration, 'graphql.resolvers.Mutation', {}),
    }

    const options = { ...get(configuration, 'graphql.options', {}) }

    const GraphqlApolloServer = new ApolloServer({
      typeDefs: store.graphql.typeDefs,
      resolvers: {
        ...store.graphql.resolvers,
      },
      ...defaultApolloGraphqlOptions,
      ...omit(options, ['context']),
      context: async (options) => {
        const contextFromOptions = await get(
          options,
          'context',
          function () {}
        )()

        return {
          wertik: wertikApp,
          req: options.req,
          res: options.res,
          ...contextFromOptions,
        }
      },
    })

    GraphqlApolloServer.applyMiddleware({
      app: expressApp,
      ...(props?.applyMiddlewareOptions ?? {}),
    })

    console.log(
      `GraphQL server starting at http://localhost:${
        configuration.port ?? 1200
      }/${props?.applyMiddlewareOptions?.path ?? 'graphql'}`
    )

    return GraphqlApolloServer
  }
}
