"use client";

import { assertIsDefined } from "$shared/utils/validation";
import { useUser } from "#modules/core/auth/useUser";

export default function UserPage() {
  const { user } = useUser();

  assertIsDefined(user);

  return (
    <div>
      <h2>Public Name: {user.publicName}</h2>
      <p>Email: {user.email}</p>
      <p>First name: {user.firstName}</p>
      <p>Last name: {user.lastName}</p>
      <p>Roles: {user.roles.map(r=>r.name)}</p>
    </div>);
}
