import {
  createLogger,
  format as _format,
  transports as _transports,
} from "winston";
import Transport from "winston-transport";
import { Client } from "@opensearch-project/opensearch";

const host = "opensearch";
const protocol = "http"; // <-- Changing http to https worked.
const ports = [9200, 9600];
const auth = "admin:admin"; // For testing only. Don't store credentials in code.

// OpenSearch client configuration
const opensearchClient = new Client({
  nodes: [
    protocol + "://" + auth + "@" + host + ":" + ports[0],
    protocol + "://" + auth + "@" + host + ":" + ports[1],
  ],
  ssl: {
    rejectUnauthorized: false,
  },
});

class OpenSearchTransport extends Transport {
  constructor() {
    super();
    this.name = "opensearchTransport";
    this.level = "info";
  }

  log(info, next) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message: info.message,
      statusCode: info.statusCode || null,
      container: process.env.HOSTNAME || "unknown-container",
    };

    opensearchClient
      .index({
        index: "lb-log",
        body: logEntry,
      })
      .catch((err) => {
        console.error("Error indexing log entry: ", err);
      });

    next();
  }
}

const prettyJson = _format.printf((info) => {
  if (info.message.constructor === Object) {
    info.message = JSON.stringify(info.message, null, 4);
  }
  return `${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: "info",
  format: _format.combine(
    _format.timestamp(),
    _format.json(),
    _format.colorize(),
    _format.prettyPrint(),
    prettyJson
  ),
  transports: [new OpenSearchTransport(), new _transports.Console()],
});

logger.info("Logger initialized successfully", { statusCode: 200 });

export default logger;
