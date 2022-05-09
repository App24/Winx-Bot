import { BaseGuildTextChannel, MessageAttachment } from "discord.js";
import { BotUser } from "../BotClient";
import { DATABASE_FOLDER } from "../Constants";
import { getGuildById, getTextChannelById } from "../utils/GetterUtils";
import { backupDatabases, reportError } from "../utils/Utils";
import fs from "fs";
import archiver from "archiver";
import { dateToString } from "../utils/FormatUtils";

let backupChannel: BaseGuildTextChannel;

export = () => {
    BotUser.on("ready", async () => {
        const midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        const backupChannelAny: any = await BotUser.channels.fetch(process.env.BACKUP_CHANNEL);
        backupChannel = await getTextChannelById(process.env.BACKUP_CHANNEL, await getGuildById(backupChannelAny.guildId));
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
        const output = fs.createWriteStream(file);
        const archive = archiver("zip");
        archive.on("error", (err) => {
            throw err;
        });

        archive.directory(DATABASE_FOLDER, false);

        archive.pipe(output);

        await archive.finalize();

        await backupChannel.send({ files: [new MessageAttachment(file)] });
        fs.unlinkSync(file);
    } catch (error) {
        await reportError(error.stack);
    }
}