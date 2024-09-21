import { fileURLToPath } from 'url';
import path from 'path';
import { createLogger, format as _format, transports as _transports } from 'winston';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    // Log to console
    new _transports.Console(),
    
    // Log to file (error level)
    new _transports.File({ 
      filename: join(__dirname, 'logs', 'error.log'), 
      level: 'error' 
    }),
    
    // Log all to file
    new _transports.File({ 
      filename: join(__dirname, 'logs', 'combined.log') 
    })
  ]
});

export default logger;
