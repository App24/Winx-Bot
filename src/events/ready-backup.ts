import fs from "fs";
import archiver from "archiver";
import { BotUser } from "../BotClient";
import { BACKUP_CHANNEL, DATABASE_FOLDER } from "../Constants";
import { getGuildByID, getGuildChannelByID } from "../GetterUtilts";
import { backupDatabases, dateToString, secondsToTime } from "../Utils";
import { MessageAttachment } from "discord.js";

let backupChannel;

export=()=>{
    BotUser.on("ready", async()=>{
        const midnight=new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        backupChannel=await getGuildChannelByID(BACKUP_CHANNEL, (await getGuildByID("700663163699462205")));
        setTimeout(()=>{
            backup();
            setInterval(()=>{
                backup();
            }, 1000*60*60*24);
        }, midnight.getTime()-new Date().getTime());
    });
};

async function backup(){
    const newDate=new Date();
    console.log(`[${dateToString(newDate, "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")}] Backing up...`);
    backupDatabases();

    const file=`${dateToString(newDate, "{dd}_{MM}_{YYYY}")}.zip`;
    const output=fs.createWriteStream(file);
    const archive=archiver("zip");
    archive.on("error", (err)=>{
        throw err;
    });

    archive.directory(DATABASE_FOLDER, false);

    archive.pipe(output);

    await archive.finalize();

    await backupChannel.send(new MessageAttachment(file));
    fs.unlinkSync(file);
}