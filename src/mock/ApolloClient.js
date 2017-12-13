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
export class ApolloClient {
  constructor(mocks) {
    this.mocks = mocks;
  }

  async mutate(options) {}

  watchQuery(options) {
    return {
      refetch: async options => {},
      fetchMore: async options => {},
      setOptions: () => {},
      getLastResult: () => {},
      currentResult: () => ({ loading: false, error: null, data: {} }),
      subscribe: ({ next, error }) => ({
        unsubscribe: () => {}
      })
    };
  }
}
