const TESTS = "/tests";

export const testsRoutes = {
  createOauthUser: {
    path: `${TESTS}/users/oauth/create`,
  },
  loginOauthUser: {
    path: `${TESTS}/users/oauth/login`,
  },
  verificationToken: {
    get: {
      path: `${TESTS}/users/local/verification-token`,
      withParams: (username: string) => `${TESTS}/users/local/verification-token?username=${username}`,
    },
  },
  resetFixtures: {
    path: `${TESTS}/db/fixtures/reset`,
  },
};
