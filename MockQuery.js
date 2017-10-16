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

  mutate = async options => {};

  watchQuery = options => ({
    refetch: () => {},
    fetchMore: () => {},
    subscribe: ({ next, error }) => ({
      unsubscribe: () => {}
    })
  });
}
