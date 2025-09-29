type Props = {
  var1: string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TestTemplate = ( { var1 }: Props) => {
  return <div>
    <h1>Test</h1>
    <p>{var1}</p>
  </div>;
};
