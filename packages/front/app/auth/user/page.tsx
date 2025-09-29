"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { useUser } from "#modules/core/auth/useUser";

export default function Search() {
  const { user } = useUser();

  assertIsDefined(user);

  return (
    <div>
      <h2>OK, {user.publicName}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}
