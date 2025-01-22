/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */
const NodeMediaServer = require("node-media-server");

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: false,
    ping: 1,
    ping_timeout: 1,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    api: true,
  },
  auth: {
    play: false,
    publish: false,
    secret: "nodemedia2017privatekey",
  },
};
const nms = new NodeMediaServer(config);

export default nms;
