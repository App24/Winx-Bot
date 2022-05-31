import { BaseGuildTextChannel, MessageAttachment } from "discord.js";
import { BotUser } from "../BotClient";
import { DATABASE_FOLDER } from "../Constants";
import { backupDatabases, reportError } from "../utils/Utils";
import fs from "fs";
import { zip } from "zip-a-folder";
import { dateToString } from "../utils/FormatUtils";

let backupChannel: BaseGuildTextChannel;

export = () => {
    BotUser.on("ready", async () => {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        backupChannel = <BaseGuildTextChannel>(await BotUser.channels.fetch(process.env.BACKUP_CHANNEL));
        setTimeout(() => {
            backup();
            setInterval(() => {
                backup();
            }, 1000 * 60 * 60 * 24);
        }, midnight.getTime() - new Date().getTime());
    });
};

async function backup() {
    const newDate = new Date();
    console.log(`[${dateToString(newDate, "{HH}:{mm}:{ss} {dd}/{MM}/{YYYY}")}] Backing up...`);
    backupDatabases();

    try {
        const file = `${dateToString(newDate, "{dd}_{MM}_{YYYY}")}.zip`;
        await zip(DATABASE_FOLDER, file);

        await backupChannel.send({ files: [new MessageAttachment(file)] });
        fs.unlinkSync(file);
    } catch (error) {
        await reportError(error.stack);
    }
}