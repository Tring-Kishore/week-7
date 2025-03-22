import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP connection to the GraphQL backend
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Replace with your GraphQL endpoint
});

// Add authentication headers if needed
const authLink = setContext((_, { headers }) => {
  // Get the token from localStorage (or wherever you store it)
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Include the token in the Authorization header
    },
  };
});

// Create the Apollo Client instance
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Chain the auth link with the HTTP link
  cache: new InMemoryCache(), // Cache for storing query results
});

export default client;