import { join } from "path";
import fs from "fs";
import request from "request";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER, PREFIX } from "../Constants";
import { DatabaseType } from "../structs/DatabaseTypes";
import { BaseGuildTextChannel, Guild, GuildMember, Message, MessageAttachment, MessageEmbed, MessageEmbedOptions, TextBasedChannel } from "discord.js";
import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";
import { ErrorStruct } from "../structs/databaseTypes/ErrorStruct";
import { getBotRoleColor, getMemberById, getUserById } from "./GetterUtils";
import { PatreonInfo } from "../structs/databaseTypes/PatreonInfo";
import { Keyv } from "../keyv/keyv-index";
import { Canvas } from "canvas";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { Color } from "../structs/Color";
import { Stream } from "stream";

/**
 * 
 * @param array list of items to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncForEach<U>(array: U[], callbackFn: (value: U, index: number, array: readonly U[]) => Promise<any> | any) {
    for (let i = 0; i < array.length; i++) {
        const exit = await callbackFn(array[i], i, array);
        if (exit === true) return true;
    }
    return false;
}

/**
 * 
 * @param map map to iterate through
 * @param callbackFn callback function to run
 */
export async function asyncMapForEach<U, T>(map: Map<U, T>, callbackFn: (key: U, value: T, index: number, map: ReadonlyMap<U, T>) => Promise<any> | any) {
    const keys = Array.from(map.keys());
    const values = Array.from(map.values());
    for (let i = 0; i < map.size; i++) {
        const exit = await callbackFn(keys[i], values[i], i, map);
        if (exit === true) break;
    }
}

/**
 * Get all files in a folder and its subfolders
 * @param directory the parent directory to get all files from
 * @returns all files found in all sub-directories
 */
export function loadFiles(directory: string) {
    const files: string[] = [];
    const dirs: string[] = [];

    try {
        if (fs.existsSync(directory)) {
            const dirContent = fs.readdirSync(directory);

            dirContent.forEach(file => {
                const fullPath = join(directory, file);

                if (fs.statSync(fullPath).isFile())
                    files.push(fullPath);
                else
                    dirs.push(fullPath);
            });

            dirs.forEach(dir => {
                loadFiles(dir).forEach(file => files.push(file));
            });
        }
    } catch (ex) {
        console.error(ex);
        return;
    }

    return files;
}

/**
 * 
 * @param value 
 * @param min minimum value that the value can be
 * @param max maximum value that the value can be
 * @returns clamped valued
 */
export function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

/**
 * 
 * @param size the length of the string
 * @returns hex string
 */
export function genRanHex(size: number) {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function toHexString(byteArray: number[]) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}

/**
 * 
 * @param database Database to get the data from
 * @param guildId Guild ID of the server
 * @param defaultValue The default value to set if there isn't any
 * @returns Data stored in database
 */
export async function getServerDatabase<U>(database: Keyv, guildId: string, defaultValue: any = []): Promise<U> {
    let serverDatabase = await database.get(guildId);
    if (!serverDatabase) {
        serverDatabase = defaultValue;
        await database.set(guildId, serverDatabase);
    }
    return serverDatabase;
}

/**
 * 
 * @param channel 
 * @returns True if the chanell is DM, false if not
 */
export function isDM(channel: TextBasedChannel) {
    return channel.type === "DM";
}

/**
 * 
 * @param userId The ID of the user
 * @param guildId The ID of the guild
 * @returns True if the user is a patreon, false if the user is not a patreon
 */
export async function isPatreon(userId: string, guildId: string) {
    if (!userId || !guildId) return false;
    const Patreon = BotUser.getDatabase(DatabaseType.Paid);
    const patreon: PatreonInfo[] = await Patreon.get(guildId);
    if (!patreon || !patreon.length) return false;
    return patreon.find(user => user.userId === userId) !== undefined;
}

/**
 * 
 * @param data Canvas to convert
 * @param fileName Name of file to send to discord
 * @returns Message Attachment
 */
export function canvasToMessageAttachment(data: Canvas | Buffer, fileName = "color", fileExtension = "png") {
    return new MessageAttachment(data instanceof Canvas ? data.toBuffer() : data, `${fileName}.${fileExtension}`);
}

/**
 * Check if a string is a valid hex color
 * @param str String to compare
 * @returns True if it is a hex color, false if it isn't
 */
export function isHexColor(str: string) {
    return new RegExp(/[a-f\d]{6}/g).test(str);
}

export function hexToRGB(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex(color: Color) {
    return ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
}

/**
 * 
 * @param a Initial Value
 * @param b End Value
 * @param w Amount to blend
 * @returns Value between `a` and `b`
 */
export function blend(a: number, b: number, w: number) {
    return (a * w) + (b * (1 - w));
}

export function blendRGB(colorA: Color, colorB: Color, w: number) {
    return {
        r: blend(colorA.r, colorB.r, w),
        g: blend(colorA.g, colorB.g, w),
        b: blend(colorA.b, colorB.b, w)
    };
}

export async function getAllMessages(channel: BaseGuildTextChannel) {
    const messages: Message[] = [];
    let msgs = await channel.messages.fetch().then(promise => Array.from(promise.values()));
    let lastMessage;
    while (msgs.length) {
        messages.push(...msgs);
        lastMessage = msgs[msgs.length - 1].id;
        msgs = await channel.messages.fetch({ before: lastMessage }).then(promise => Array.from(promise.values()));
    }
    return messages;
}

export async function getLeaderboardMembers(guild: Guild) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const levels: UserLevel[] = await getServerDatabase(Levels, guild.id);
    levels.sort((a, b) => {
        if (a.level === b.level) {
            return b.xp - a.xp;
        }
        return b.level - a.level;
    });
    const leaderboardLevels: { userLevel: UserLevel, member: GuildMember, position: number }[] = [];
    let userIndex = 0;
    await asyncForEach(levels, async (level: UserLevel) => {
        const member = await getMemberById(level.userId, guild);
        if (member) {
            leaderboardLevels.push({ userLevel: level, member, position: userIndex });
            userIndex++;
            if (userIndex >= 15)
                return true;
        }
    });
    return leaderboardLevels;
}

export function backupDatabases() {
    if (!fs.existsSync(DATABASE_BACKUP_FOLDER)) {
        fs.mkdirSync(DATABASE_BACKUP_FOLDER);
    }

    const values = Object.values(DatabaseType);
    values.forEach((value) => {
        fs.copyFileSync(`${DATABASE_FOLDER}/${value}.sqlite`, `${DATABASE_BACKUP_FOLDER}/${value}.sqlite`);
    });
}

export async function reportError(error, message?: Message) {
    const Errors = BotUser.getDatabase(DatabaseType.Errors);
    let hex: string;
    let errors;
    do {
        hex = genRanHex(16);
        errors = await Errors.get(hex);
    } while (errors);
    console.error(`Code: ${hex}\n${error}`);
    const errorObj = new ErrorStruct();
    errorObj.time = new Date().getTime();
    errorObj.error = error;
    await Errors.set(hex, errorObj);

    const owner = await getUserById(process.env.OWNER_ID);

    const dm = await owner.createDM();
    await dm.send("Error");
    await dm.send(hex);

    if (message) {
        const ownerMember = await getMemberById(owner.id, message.guild);
        if (ownerMember) {
            let text = `\nServer: ${message.guild.name}`;
            text += `\nURL: ${message.url}`;
            await dm.send(text);
        }
        message.reply(Localisation.getTranslation("error.execution"));
    }
}

export function isModerator(member: GuildMember) {
    if (!member) return false;
    return member.permissions.has("MANAGE_GUILD");
}

export async function createMessageEmbed(data: MessageEmbedOptions | MessageEmbed, guild: Guild) {
    const embed = new MessageEmbed(data);
    embed.setColor(await getBotRoleColor(guild));
    const footers = [Localisation.getTranslation("footer.donate", process.env.npm_package_config_donate), Localisation.getTranslation("footer.suggestion", PREFIX, "suggestion")];
    const option = Math.floor((footers.length * 10) * Math.random());
    if (option < footers.length)
        embed.setFooter({ text: `${(data.footer && data.footer.text) || ""}\n${footers[option]}` });
    return embed;
}

export function downloadFile(uri: string, fileName: string, callback?: () => void) {
    request.head(uri, function () {
        request(uri).pipe(fs.createWriteStream(fileName)).on("close", callback);
    });
}

export function getBrightnessColor(color: Color, brightColor = "white", darkColor = "black") {
    const brightness = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    return (brightness > 125) ? darkColor : brightColor;
}

export async function stream2buffer(stream: Stream): Promise<Buffer> {

    return new Promise<Buffer>((resolve, reject) => {

        const _buf = Array<any>();

        stream.on("data", chunk => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", err => reject(`error converting stream - ${err}`));

    });
}

export function toBuffer(ab: ArrayBuffer) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export function toArrayBuffer(buf: Buffer) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}