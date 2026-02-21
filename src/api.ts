import AggregatesPlugin from "@graphile/pg-aggregates";
import SimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import express from "express";
import { NodePlugin } from "graphile-build";
import { postgraphile } from "postgraphile";
import FilterPlugin from "postgraphile-plugin-connection-filter";
import { ProcessorStatusPlugin } from "./plugins/processorStatusPlugin.js";

const app = express();

app.use(
  postgraphile(
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
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
    },
  ),
);

const port = process.env.GRAPHQL_SERVER_PORT || 4350;

app.listen(port, () => {
  console.log(`GraphQL API listening on port ${port}`);
  console.log(`GraphiQL playground: http://localhost:${port}/graphiql`);
});
