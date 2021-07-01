import fs from 'fs';
import { parse } from './Utils';

const LOGS_FOLDER="logs";
const LOG_NAME="log_%s.txt";

let log_file="";

export={Initialise, Log}

function Initialise(){
    if(!fs.existsSync(LOGS_FOLDER)){
        fs.mkdirSync(LOGS_FOLDER);
    }

    log_file=parse(LOG_NAME, getTime("%Y-%m-%d-%H-%M-%S"));

    if(!fs.existsSync(`${LOGS_FOLDER}/${log_file}`)){
        fs.writeFileSync(`${LOGS_FOLDER}/${log_file}`, "");
    }
}

function Log(message){
    const newMessage=`[${getTime("%H:%M:%S")}]: ${message}`;
    fs.appendFileSync(`${LOGS_FOLDER}/${log_file}`, newMessage);
    console.log(`[${getTime("%H:%M:%S")}]: ${message}`);
}

function getTime(format){
    return dateFormat(new Date(), format, true);
}

function dateFormat (date : Date, fstr : string, utc : boolean|string) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace (/%[YmdHMS]/g, function (m) {
      switch (m) {
      case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
      case '%m': m = 1 + date[utc + 'Month'] (); break;
      case '%d': m = date[utc + 'Date'] (); break;
      case '%H': m = date[utc + 'Hours'] (); break;
      case '%M': m = date[utc + 'Minutes'] (); break;
      case '%S': m = date[utc + 'Seconds'] (); break;
      default: return m.slice (1); // unknown code, remove %
      }
      // add leading zero if required
      return ('0' + m).slice (-2);
    });
  }