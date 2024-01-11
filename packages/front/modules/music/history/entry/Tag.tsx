type Props = {
  name: string;
};
export default function Tag( {name}: Props) {
  return <span style={{
    padding: "0 0.5em",
    margin: "0 0.25em",
    borderRadius: "0.5em",
    border: "1px solid #000",
  }}><span>{name}</span> <span>X</span></span>;
}