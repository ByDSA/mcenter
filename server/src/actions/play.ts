import { Request, Response } from "express";

export default function (req: Request, res: Response) {
    const { id, type, force } = getParams(req, res);

    if (!res.writableEnded)
        res.send(
            `<h1>Play</h1>
        <p>Type: ${type}</p>
        <p>ID: ${id}</p>
        <p>Force: ${force}</p>`
        );
};

function getParams(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id, type } = req.params;

    if (!id || !type) {
        res.status(400);
        res.send("No ID nor TYPE.");
        res.end();
    }

    switch (type) {
        case "serie":
        case "peli":
            break;
        default:
            res.status(400);
            res.send(`Type '${type}' is invalid.`);
            res.end();
    }

    return {
        id,
        type,
        force
    }
}