/**
 * Example:
 *
 * const mockClient = new MockClient({
 *  quer
 * })
 * const LayoutWithData = () =>
 *  <Provider client={mockClient}>
 *    <Layout>{children}</Layout>
 *  </Provider>
 */
export class MockClient {
  constructor(mocks) {
    this.mocks = mocks;
  }

  mutate(options) {
    return new Promise(resolve => resolve());
  }

  watchQuery(options) {
    return {
      refetch: options => new Promise(resolve => resolve()),
      fetchMore: options => new Promise(resolve => resolve()),
      subscribe: ({ next, error }) => ({
        unsubscribe: () => {}
      })
    };
  }
}
