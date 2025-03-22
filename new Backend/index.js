// index.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema/schema'); // Import your GraphQL schema
const resolvers = require('./schema/resolvers'); // Import your resolvers
const { pool } = require('./db'); // Import your database connection pool
const jwt = require('jsonwebtoken'); // For JWT authentication

// Create an Express app
const app = express();

// Middleware to verify JWT token
const authenticateUser = (req) => {
  const token = req.headers.authorization || '';
  if (token) {
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new Error('Invalid or expired token');
    }
  }
  return null;
};

// Create an Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Authenticate the user and add the user info to the context
    const user = authenticateUser(req);
    return { user, pool }; // Pass the database pool and user info to resolvers
  },
});

// Start the Apollo Server and apply middleware to Express
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  // Start the Express server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Error starting server:', error);
});