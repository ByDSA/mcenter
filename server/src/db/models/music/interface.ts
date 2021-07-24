export default interface Interface {
  hash: string;
  title: string;
  url: string;
  path: string;
  weight?: number;
  artist?: string;
  tags?: string[];
  duration?: number;
  disabled?: boolean
}
