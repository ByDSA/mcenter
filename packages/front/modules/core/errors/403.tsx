import { FullPageContainer } from "app/FullPageContainer";
import { i18nServerContext } from "#modules/core/i18n/server-locale";

export async function Forbidden() {
  const { LL } = await i18nServerContext();

  return (
    <FullPageContainer>
      <div className="error-page">
        <h1>{LL.core.errors.forbidden.title()}</h1>
        <p>{LL.core.errors.forbidden.message()}</p>
      </div>
    </FullPageContainer>
  );
}
