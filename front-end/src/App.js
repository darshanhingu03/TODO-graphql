
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  
} from "@apollo/client";
import TodoTable from "./TodoTable";

// Create a function to initialize the client to ensure proper setup
function createApolloClient() {
  // First create the HTTP link
  const httpLink = createHttpLink({
    uri: "http://localhost:8000/graphql",
    // Add credentials if needed
    credentials: "same-origin",
  });

  // Initialize cache with type policies if needed
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getTodos: {
            // Merge function for proper cache updates
            merge(existing = [], incoming) {
              return [...incoming];
            },
          },
        },
      },
    },
  });

  // Create and return the client instance
  return new ApolloClient({
    link: httpLink,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "ignore",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
    // Add error handling
    onError: ({ networkError, graphQLErrors }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        });
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    },
  });
}

// Create your client instance
const client = createApolloClient();


// Your App component
function App() {
  return (
    <ApolloProvider client={client}>
      <TodoTable />
    </ApolloProvider>
  );
}

export default App;
