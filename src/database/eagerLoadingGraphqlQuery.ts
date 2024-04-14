import  { wertikApp } from "../store"
import isPlainObject from "lodash.isplainobject"
import get from "lodash.get"
import has from "lodash.has"
import convertFiltersIntoSequelizeObject from "../utils/convertFiltersIntoSequelizeObject"
import { generateRequestedFieldsFromGraphqlInfo } from "../modules/modulesHelpers"

const clean = (cleanObject) => {
  let recursion = (_obj) => {
    Object.keys(_obj).forEach((key) => {
      if (key === "rows") {
        _obj = { ..._obj, ..._obj["rows"] }
        delete _obj["rows"]
      }
    })

    Object.keys(_obj).forEach((key) => {
      if (isPlainObject(_obj[key]) && key !== "__arguments") {
        _obj[key] = recursion(_obj[key])
      }
    })

    return _obj
  }

  return recursion(cleanObject)
}

export const convertGraphqlRequestedFieldsIntoInclude = (
  graphqlFields = {},
  args: any = {},
  module: any = {}
) => {
  let order = []
  let depth = []
  graphqlFields = clean(graphqlFields)
  const currentModuleRelationships = wertikApp.store.database.relationships.filter(
    (f) => f.currentModule == module.name
  )

  const currentModuleRelationshipsKeys = currentModuleRelationships.map(
    (c) => c.graphqlKey
  )
  const allRelationshipKeys = wertikApp.store.database.relationships.map(
    (c) => c.graphqlKey
  )

  const requiredFilters = currentModuleRelationshipsKeys.filter((c) =>
    Object.keys(args.where ?? {}).includes(c)
  )

  Object.keys(args.order ?? {}).forEach((element) => {
    order.push([element, args.order[element]])
  })

  let recursion = (_obj) => {
    let includes = []

    Object.keys(_obj).forEach((key) => {
      if (allRelationshipKeys.includes(key)) {
        depth.push(key)
        let _localDepth = [...JSON.parse(JSON.stringify(depth))]
        const relationship = wertikApp.store.database.relationships.find(
          (c) => c.graphqlKey === key
        )
        const sequelizeModel = wertikApp.models[relationship.referencedModule]
        const includeParams: { [key: string]: any } = {
          required: false,
          model: sequelizeModel,
          as: key,
          attributes: generateRequestedFieldsFromGraphqlInfo(_obj[key]),
          include:
            Object.keys(_obj[key]).length > 0 ? recursion(_obj[key]) : [],
        }

        let __arguments = get(_obj, `[${key}].__arguments`, [])
        let __whereInArguments = __arguments.find((c) => has(c, "where"))
        let __orderInArguments = __arguments.find((c) => has(c, "order"))
        let __limitInArguments = __arguments.find((c) => has(c, "limit"))
        let __offsetInArguments = __arguments.find((c) => has(c, "offset"))
        __limitInArguments = get(__limitInArguments, "limit.value", null)
        __offsetInArguments = get(__offsetInArguments, "offset.value", null)
        __orderInArguments = get(__orderInArguments, "order.value", null)

        if (isPlainObject(__orderInArguments)) {
          Object.keys(__orderInArguments).forEach((element) => {
            order.push([..._localDepth, element, __orderInArguments[element]])
          })
        }

        if (__whereInArguments) {
          __whereInArguments = get(__whereInArguments, "where.value", {})
          __whereInArguments =
            convertFiltersIntoSequelizeObject(__whereInArguments)

          includeParams.where = __whereInArguments
        }

        if (__limitInArguments) includeParams.limit = __limitInArguments
        if (__offsetInArguments) includeParams.offset = __offsetInArguments
        includes.push(includeParams)
      }
    })
    return includes
  }

  let include = recursion(graphqlFields)
  /**
    * Make sure the include is required if filters are requested in root level filters.
    * If root level filters are not met then the response will be null.
    * In below graphql query, it will return if user has id 2 and written a post which id is 132, if id is not found then whole response will be null.
    query viewUser {
      viewUser(where: { id: { _eq: 2 }, posts: { id: { _eq: 123 } } }) {
        id
        name
      }
    }
  */
  include = include.map((c) => {
    if (requiredFilters.includes(c.as)) {
      c.required = true
      c.where = convertFiltersIntoSequelizeObject(args.where[c.as])
    }

    return c
  })

  return {
    include,
    order,
  }
}
