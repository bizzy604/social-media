import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { getToken } from "./auth"

// Define environment variable types
declare global {
  interface ImportMeta {
    env: {
      VITE_GRAPHQL_URL?: string;
    };
  }
}

// Create HTTP link
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
})

// Add auth headers
const authLink = setContext((_, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

// Add logging middleware
const loggerLink = new ApolloLink((operation: any, forward: any) => {
  console.log(`GraphQL Request: ${operation.operationName}`, {
    variables: operation.variables,
  });

  return forward(operation).map((response: any) => {
    console.log(`GraphQL Response: ${operation.operationName}`, {
      data: response.data,
      errors: response.errors,
    });
    return response;
  });
});

// Create Apollo Client
export const client = new ApolloClient({
  link: loggerLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
})
