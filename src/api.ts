import AggregatesPlugin from "@graphile/pg-aggregates";
import SimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import express from "express";
import { NodePlugin } from "graphile-build";
import type * as pg from "pg";
import {
  gql,
  makeExtendSchemaPlugin,
  postgraphile,
  Plugin,
} from "postgraphile";
import FilterPlugin from "postgraphile-plugin-connection-filter";

const app = express();

const ProcessorStatusPlugin: Plugin = makeExtendSchemaPlugin(
  (_build, options) => {
    const schemas: string[] = options.stateSchemas || ["squid_processor"];

    return {
      typeDefs: gql`
        type _ProcessorStatus {
          name: String!
          height: Int!
          hash: String!
        }

        extend type Query {
          squidStatus: [_ProcessorStatus!]!
        }
      `,
      resolvers: {
        Query: {
          squidStatus: async (
            _parentObject: unknown,
            _args: unknown,
            context: { pgClient: pg.Client }
          ) => {
            try {
              const { rows } = await context.pgClient.query(
                schemas
                  .map(
                    (s) =>
                      `SELECT '${s}' as name, height, hash FROM ${s}.status`
                  )
                  .join(" UNION ALL ")
              );
              return rows || [];
            } catch (e: unknown) {
              if (
                e instanceof Error &&
                e.message.includes("does not exist")
              ) {
                return schemas.map((s) => ({
                  name: s,
                  height: -1,
                  hash: "0x",
                }));
              }
              throw e;
            }
          },
        },
      },
    };
  }
);

app.use(
  postgraphile(
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME || "squid",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASS || "postgres",
    },
    "public",
    {
      graphiql: true,
      enhanceGraphiql: true,
      dynamicJson: true,
      disableDefaultMutations: true,
      disableQueryLog: true,
      skipPlugins: [NodePlugin],
      appendPlugins: [
        AggregatesPlugin,
        FilterPlugin,
        SimplifyInflectorPlugin,
        ProcessorStatusPlugin,
      ],
      graphileBuildOptions: {
        stateSchemas: ["squid_processor"],
      },
    }
  )
);

const port = process.env.GRAPHQL_SERVER_PORT || 4350;

app.listen(port, () => {
  console.log(`GraphQL API listening on port ${port}`);
  console.log(`GraphiQL playground: http://localhost:${port}/graphiql`);
});
