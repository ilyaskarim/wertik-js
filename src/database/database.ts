import get from "lodash.get"
import { wLog, wLogWithInfo } from "../utils/log"
import { paginate } from "../crud/paginate"
import { Store, WertikApp } from "../types"
import logSymbols from "log-symbols"

export const applyRelationshipsFromStoreToDatabase = async (
  store: Store,
  app: WertikApp
) => {
  if (store.database.relationships.length > 0)
    wLogWithInfo("[Wertik-Database]", "Registering relationships \n")
  store.database.relationships.forEach((element) => {
    const currentTable = app.modules[element.currentModule].tableInstance
    const referencedTable = app.modules[element.referencedModule].tableInstance
    const currentTableName = currentTable.getTableName() as string
    const referencedTableName = referencedTable.getTableName() as string

    wLog(
      logSymbols.success,
      `${currentTableName}.${
        element.type
      }(${referencedTableName}, ${JSON.stringify(element.options)})`
    )

    // element.type will be hasOne, hasMany, belongsTo or belongsToMany
    currentTable[element.type](referencedTable, element.options || {})
  })
  if (store.database.relationships.length > 0) wLog("\n")
}

export const applyRelationshipsFromStoreToGraphql = async (
  store: Store,
  _app: WertikApp
) => {
  store.database.relationships.forEach((element) => {
    const oldResolvers = get(
      store,
      `graphql.resolvers.${element.currentModule}`,
      {}
    )

    store.graphql.resolvers[element.currentModule] = {
      ...oldResolvers,
      [element.graphqlKey]: async (parent, _args, context, info) => {
        const tableInstance =
          context.wertik.modules[element.referencedModule].tableInstance
        let referencedModuleKey =
          element.options.sourceKey || element.options.targetKey
        let currentModuleKey = element.options.foreignKey || "id"

        if (!referencedModuleKey) {
          referencedModuleKey = "id"
        }

        if (["hasOne", "belongsTo"].includes(element.type)) {
          if (parent[info.fieldName]) {
            return parent[info.fieldName]
          }
          return await tableInstance.findOne({
            where: {
              [currentModuleKey]: parent[referencedModuleKey],
            },
          })
        } else if (["hasMany", "belongsToMany"]) {
          if (parent[info.fieldName]) {
            return { list: parent[info.fieldName] }
          }
          return await paginate(
            {
              where: {
                [currentModuleKey]: parent[referencedModuleKey],
              },
            },
            tableInstance
          )
        }
      },
    }
  })
}
