import { Express } from "express";
import { Http2Server } from "http2";
import { Sequelize } from "sequelize/types";

export interface NextConfigurationProps {
  port: number;
  skip: any;
  express: any;
  database: {
    [key: string]: {
      name: string;
      username: string;
      password: string;
      host: number;
      options: {
        [key: string]: any;
      };
    };
  };
  modules: any;
  cronJobs: any;
  sockets: any;
  graphql: any;
  [Key: string]: any;
}

export interface WertikApp {
  express?: Express;
  server?: Http2Server;
  port: number | string;
  skip: boolean;
  email: {};
  database: {
    [key: string]: WertikDatabase;
  };
  graphql: {};
  modules: { [key: string]: WertikModule };
  storage: {
    [key: string]: WertikStorage;
  };
}
export interface WertikDatabase {
  credentials: WertikDatabaseCredentials;
  instance: Sequelize;
}
export interface WertikModule {}
export interface WertikDatabaseCredentials {
  port: number;
  password: string;
  username: string;
  host: string;
  name: string;
}
export interface WertikStorage {}
export interface useGraphqlProps {}
export interface useCronJobsProps {}
export interface useMailerProps {}
export interface useIndependentWebSocketsServerProps {}
export interface useWebSocketsProps {}
export interface useSocketIOProps {}
export interface useDatabaseProps {}

export interface useModuleProps {
  name: string;
  useDatabase: boolean;
  table?: string;
  database?: string;
  tableOptions?: any;
  graphql?: {
    schema?: string;
  };
  on?: (obj: {
    useQuery: (props: useQueryProps) => {} | void;
    useMutation: (props: useMutationProps) => {} | void;
    useExpress: (props: useExpressProps) => {} | void;
    hasOne: (props: RelationParams) => {} | void;
    belongsTo: (props: RelationParams) => {} | void;
    belongsToMany: (props: RelationParams) => {} | void;
    hasMany: (props: RelationParams) => {} | void;
    useSchema: (props: useSchemaProps) => {} | void;
  }) => void;
  events?: {
    beforeView?: Function;
    beforeCount?: Function;
    beforeList?: Function;
    beforeCreate?: Function;
    beforeDelete?: Function;
    beforeUpdate?: Function;
  };
}
export interface useQueryProps {
  query: string;
  resolver: Function;
  name: string;
}
export interface useMutationProps {
  query: string;
  resolver: Function;
  name: string;
}
export type useExpressProps = Function;
export interface RelationParams {
  module: string;
  graphqlKey: string;
  database: string;
  options: {
    [key: string]: string | number | null;
  };
}
export type useSchemaProps = string;
