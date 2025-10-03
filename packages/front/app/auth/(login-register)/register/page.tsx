"use client";

/* eslint-disable require-await */
import { useRouter } from "next/navigation";
import { AuthApi } from "#modules/core/auth/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { RegisterComponent } from "./Register";

export default function RegisterPage() {
  const router = useRouter();

  return RegisterComponent( {
    handleRegister: async (dto)=> {
      const api = FetchApi.get(AuthApi);

      await api.localSignUp(dto);

      router.push("./register/done?email=" + dto.email);
    },
    handleGotoLogin: async ()=> {
      router.push("./login");
    },
  } );
}
