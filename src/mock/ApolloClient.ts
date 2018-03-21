/**
 * Example:
 *
 * const mockClient = new ApolloClient({
 *  quer
 * })
 * const LayoutWithData = () =>
 *  <Provider client={mockClient}>
 *    <Layout>{children}</Layout>
 *  </Provider>
 */
export class ApolloClient<T> {
  mocks: T[];

  constructor(mocks: T[]) {
    this.mocks = mocks;
  }

  async mutate() {}

  watchQuery() {
    return {
      refetch: async () => {},
      fetchMore: async () => {},
      setOptions: () => {},
      getLastResult: () => {},
      currentResult: () => ({ loading: false, error: null, data: {} }),
      subscribe: ({}) => ({
        unsubscribe: () => {}
      })
    };
  }
}
