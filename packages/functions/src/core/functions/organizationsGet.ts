import { authedProcedure } from '~/trpc';

export const organizationsGet = authedProcedure.query(
  async ({ ctx: { session: _session } }) => {
    const organizations = await Promise.resolve([
      { admin: false, name: 'fakeName', id: 'testId' },
    ]);

    return organizations;
  },
);
