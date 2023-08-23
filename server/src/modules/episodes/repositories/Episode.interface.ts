export default interface DocODM {
  id: string;
  path: string;
  title?: string;
  weight?: number;
  start?: number;
  end?: number;
  duration?: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
}