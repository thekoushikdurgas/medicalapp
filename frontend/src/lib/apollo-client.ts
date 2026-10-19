/**
 * Apollo Client configured for the Pharmacy Fantasy GraphQL API.
 */

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { AUTH_KEYS } from "@/lib/auth";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Read token from localStorage (client-side only)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem(AUTH_KEYS.TOKEN) || localStorage.getItem("access_token") || "";
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
