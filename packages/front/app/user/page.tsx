"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { useUser } from "#modules/core/auth/useUser";
import LoggedLayout from "#modules/core/auth/Logged.layout";

export default function Search() {
  const { user } = useUser();

  assertIsDefined(user);

  <LoggedLayout></LoggedLayout>;

  return (
    <div>
      <h2>OK, {user.publicName}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}
