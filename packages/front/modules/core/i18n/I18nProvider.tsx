"use client";

import { ReactNode } from "react";
import TypesafeI18n from "./i18n-react";
import { loadAllLocales } from "./i18n-util.sync";
import { Locales } from "./i18n-types";

// Carga los locales síncronamente al inicializar el módulo (solo cliente)
loadAllLocales();

export function I18nProvider( { children, locale }: { children: ReactNode;
locale: Locales; } ) {
  return (
    <TypesafeI18n locale={locale}>
      {children}
    </TypesafeI18n>
  );
}
