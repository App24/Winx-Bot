import { join } from "path";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import request from "request";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER, LB_USERS, PREFIX } from "../Constants";
import { DatabaseType } from "../structs/DatabaseTypes";
import { BaseGuildTextChannel, ChannelType, CommandInteraction, Guild, GuildMember, Message, AttachmentBuilder, MessageComponentInteraction, TextBasedChannel, ContextMenuCommandInteraction, EmbedBuilder, EmbedData } from "discord.js";
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
export async function asyncForEach<T>(array: T[], callbackFn: (value: T, index: number, array: readonly T[]) => Promise<any> | any) {
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
export async function asyncMapForEach<T, D>(map: Map<T, D>, callbackFn: (key: T, value: D, index: number, map: ReadonlyMap<T, D>) => Promise<any> | any) {
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
export function loadFiles(directory: string, fileExtension = ".*") {
    const files: string[] = [];
    const dirs: string[] = [];

    try {
        if (existsSync(directory)) {
            const dirContent = readdirSync(directory);

            dirContent.forEach(file => {
                const fullPath = join(directory, file);

                if (statSync(fullPath).isFile()) {
                    if (fullPath.endsWith(fileExtension) || fileExtension === ".*")
                        files.push(fullPath);
                }
                else {
                    dirs.push(fullPath);
                }
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
export async function getServerDatabase<T>(database: Keyv, guildId: string, defaultValue: any = []): Promise<T> {
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
    return channel.type === ChannelType.DM;
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
    const patreon: PatreonInfo[] = await getServerDatabase(Patreon, guildId);
    return patreon.find(user => user.userId === userId) !== undefined;
}

export function isBooster(member: GuildMember) {
    return member.premiumSinceTimestamp !== null;
}

/**
 * 
 * @param data Canvas to convert
 * @param fileName Name of file to send to discord
 * @returns Message Attachment
 */
export function canvasToMessageAttachment(data: Canvas | Buffer, fileName = "color", fileExtension = "png") {
    return new AttachmentBuilder(data instanceof Canvas ? data.toBuffer() : data, { name: `${fileName}.${fileExtension}` });
}

/**
 * Check if a string is a valid hex color
 * @param str String to compare
 * @returns True if it is a hex color, false if it isn't
 */
export function isHexColor(str: string) {
    return /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.test(str);
}

export function hexToRGB(hex: string) {
    const result = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/i.exec(hex);
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
            if (userIndex >= LB_USERS)
                return true;
        }
    });
    return leaderboardLevels;
}

export function backupDatabases() {
    if (!existsSync(DATABASE_BACKUP_FOLDER)) {
        mkdirSync(DATABASE_BACKUP_FOLDER);
    }

    const values = Object.values(DatabaseType);
    values.forEach((value) => {
        copyFileSync(`${DATABASE_FOLDER}/${value}.sqlite`, `${DATABASE_BACKUP_FOLDER}/${value}.sqlite`);
    });
}

export async function reportError(error, message?: Message | MessageComponentInteraction | CommandInteraction | ContextMenuCommandInteraction) {
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
            if (message instanceof Message)
                text += `\nURL: ${message.url}`;
            await dm.send(text);
        }
        if (message instanceof Message) {
            message.reply(Localisation.getTranslation("error.execution"));
        } else {
            if (!message.deferred && !message.replied)
                await message.deferReply();
            message.followUp(Localisation.getTranslation("error.execution"));
        }
    }
}

export function isModerator(member: GuildMember) {
    if (!member) return false;
    return member.permissions.has("ManageGuild");
}

export async function createMessageEmbed(data: EmbedData | EmbedBuilder, guild: Guild) {
    let embed: EmbedBuilder;
    if (data instanceof EmbedBuilder) {
        embed = data;
    } else {
        embed = new EmbedBuilder(data);
    }
    embed.setColor(await getBotRoleColor(guild));
    const footers = [Localisation.getTranslation("footer.donate", process.env.npm_package_config_donate), Localisation.getTranslation("footer.suggestion", PREFIX, "suggestion")];
    const option = Math.floor((footers.length * 10) * Math.random());
    if (option < footers.length)
        embed.setFooter({ text: `${(embed.data.footer && embed.data.footer.text) || ""}\n${footers[option]}` });
    return embed;
}

export async function downloadFile(uri: string, fileName: string) {
    return new Promise((resolve) => {
        request.head(uri, function () {
            request(uri).pipe(createWriteStream(fileName)).on("close", () => resolve(null));
        });
    });
    // request.head(uri, function () {
    //     request(uri).pipe(createWriteStream(fileName)).on("close", callback);
    // });
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

export function removeEmojis(text: string) {
    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return text.replace(regex, '');
}