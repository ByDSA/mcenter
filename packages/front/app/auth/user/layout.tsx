import LoggedLayout from "#modules/core/auth/Logged.layout";
import { PageContainer } from "app/PageContainer";

export default function SeriesLayout( { children }: {
  children: React.ReactNode;
} ) {
  return (
    <>
      <LoggedLayout>
        <PageContainer>
          <h1>Test</h1>
          {children}
        </PageContainer>
      </LoggedLayout>
    </>);
}
