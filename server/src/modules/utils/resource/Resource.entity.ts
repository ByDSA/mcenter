export default interface Model {
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

export function copyOfResource(e: Model): Model {
  const ret: Model = {
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

export function assertIsResource(model: unknown): model is Model {
  if (typeof model !== "object" || model === null)
    throw new Error("model is not an object");

  if (!("title" in model) || typeof (model as Model).title !== "string")
    throw new Error("model.title is not a string");

  if (!("path" in model) || typeof (model as Model).path !== "string")
    throw new Error("model.path is not a string");

  if (!("start" in model) || typeof (model as Model).start !== "number")
    throw new Error("model.start is not a number");

  if (!("end" in model) || typeof (model as Model).end !== "number")
    throw new Error("model.end is not a number");

  if ("weight" in model && typeof (model as Model).weight !== "number")
    throw new Error("model.weight is not a number");

  if ("tags" in model && !Array.isArray((model as Model).tags))
    throw new Error("model.tags is not an array");

  if ("duration" in model && typeof (model as Model).duration !== "number")
    throw new Error("model.duration is not a number");

  if ("disabled" in model && typeof (model as Model).disabled !== "boolean")
    throw new Error("model.disabled is not a boolean");

  if ("lastTimePlayed" in model && typeof (model as Model).lastTimePlayed !== "number")
    throw new Error("model.lastTimePlayed is not a number");

  return true;
}