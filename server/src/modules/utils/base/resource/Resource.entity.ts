export default interface Resource {
  innerId: string;
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
    innerId: e.innerId,
    title: e.title,
    path: e.path,
    weight: e.weight,
    start: e.start,
    end: e.end,
  };

  if (e.tags && e.tags.length > 0)
    ret.tags = e.tags;

  if (e.duration)
    ret.duration = e.duration;

  if (e.disabled)
    ret.disabled = e.disabled;

  if (e.lastTimePlayed)
    ret.lastTimePlayed = e.lastTimePlayed;

  return ret;
}