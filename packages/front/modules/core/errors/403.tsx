import { FullPageContainer } from "app/FullPageContainer";

export function Forbidden() {
  return (
    <FullPageContainer>
      <div className="error-page">
        <h1>403 - Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    </FullPageContainer>
  );
}
