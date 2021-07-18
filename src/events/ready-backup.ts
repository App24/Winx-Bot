import { BotUser } from "../BotClient";
import { backupDatabases, dateToString, secondsToTime } from "../Utils";

export=()=>{
    BotUser.on("ready", async()=>{
        const midnight=new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        setTimeout(()=>{
            console.log(`[${dateToString(new Date(), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")}] Backing up...`);
            backupDatabases();
            setInterval(()=>{
                console.log(`[${dateToString(new Date(), "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")}] Backing up...`);
                backupDatabases();
            }, 1000*60*60*24);
        }, midnight.getTime()-new Date().getTime());
    });
};