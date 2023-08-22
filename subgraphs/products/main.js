const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const {
    ApolloServerPluginDrainHttpServer
} = require('@apollo/server/plugin/drainHttpServer');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const express = require("express");
const cors = require('cors');
const http = require('http');
const { gql } = require("graphql-tag");
const { json, urlencoded } = require("body-parser");

const store = [
    {
        id: "1",
        title: "a book"
    }
]

let schema = {
    typeDefs: gql`

        extend schema
        @link(url: "https://specs.apollo.dev/federation/v2.3",
            import: ["@key"])

        interface Product @key(fields:"id") {
            id: ID!
        }

        type Book implements Product @key(fields:"id") {
            id:ID!
            title: String
        }

        type Query {
            allProducts: [Product!]!
        }
    `,
    resolvers: {
        Product: {
            __resolveReference: ({ id }) => store.find(e => e.id === id),
            __resolveType: () => "Book"
        },
        Query: {
            allProducts: () => store
        }
    }
}

async function startApolloServer(typeDefs, resolvers) {

    const app = express();

    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        introspection: true,
        schema: buildSubgraphSchema(schema),
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ],
    });

    await server.start();

    app.use(
        '/graphql',
        cors(),
        json(),
        expressMiddleware(server),
    );

    await new Promise(resolve => httpServer.listen({ port: 8080 }, resolve));
    console.log(`🚀 Server ready at http://localhost:8080/graphql`);

}

startApolloServer();
