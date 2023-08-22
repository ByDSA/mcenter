export default interface Resource {
  id: string;
  title: string;
  path: string;
  weight: number;
  start: number;
  end: number;
  tags?: string[];
  duration?: number;
  disabled?: boolean;
  lastTimePlayed?: number;
}

export function copyOfResource(e: Resource): Resource {
  const ret: Resource = {
    id: e.id,
    title: e.title,
    path: e.path,
    weight: e.weight,
    start: e.start,
    end: e.end,
  };

  if (e.tags !== undefined)
    ret.tags = e.tags;

  if (e.duration !== undefined)
    ret.duration = e.duration;

  if (e.disabled !== undefined)
    ret.disabled = e.disabled;

  if (e.lastTimePlayed !== undefined)
    ret.lastTimePlayed = e.lastTimePlayed;

  return ret;
}