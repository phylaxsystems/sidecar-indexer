import type * as pg from "pg";
import { gql, makeExtendSchemaPlugin, type Plugin } from "postgraphile";

export const ProcessorStatusPlugin: Plugin = makeExtendSchemaPlugin(
  (_build, options) => {
    const schemas: string[] = options.stateSchemas || ["squid_processor"];

    return {
      typeDefs: gql`
        type _Block {
          number: Int!
          hash: String!
        }

        type _Meta {
          block: _Block
        }

        extend type Query {
          _meta: _Meta!
        }
      `,
      resolvers: {
        Query: {
          _meta: async (
            _parentObject: unknown,
            _args: unknown,
            context: { pgClient: pg.Client },
          ) => {
            try {
              const { rows } = await context.pgClient.query(
                schemas
                  .map(
                    (s) => `SELECT height, hash FROM ${s}.status WHERE id = 0`,
                  )
                  .join(" UNION ALL "),
              );
              const row = rows[0];
              if (!row || row.height < 0) {
                return { block: null };
              }
              return { block: { number: row.height, hash: row.hash } };
            } catch (e: unknown) {
              if (e instanceof Error && e.message.includes("does not exist")) {
                return { block: null };
              }
              throw e;
            }
          },
        },
      },
    };
  },
);
