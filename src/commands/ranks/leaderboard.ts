import { GuildMember } from "discord.js";
import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, getLeaderboardMembers, asyncForEach, blend, canvasToMessageAttachment, hexToRGB } from "../../utils/Utils";
import { getLevelXP } from "../../utils/XPUtils";
import { secondsToTime } from "../../utils/FormatUtils";
import { createCanvas } from "canvas";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { roundRect, rgbToHsl } from "../../utils/CanvasUtils";
import { CANVAS_FONT } from "../../Constants";

class RankCommand extends Command {
    public constructor() {
        super();
        this.category = Rank;
        this.usage = [new CommandUsage(false, "argument.user")];
        this.aliases = ["rank", "lb"];
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const startDate = new Date();
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        if (!levels) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);

        let _user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            _user = temp;
        }
        if (_user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
        const member = await getMemberById(_user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        //Sorts levels list
        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);

        const data: any[][] = [];
        let i = 1;
        await asyncForEach(leaderboardLevels, async (leaderboardInfo: { userLevel: UserLevel, member: GuildMember }) => {
            const user = leaderboardInfo.member.user;
            let text = user.tag;
            text = `${i}. ${text}`;
            data.push([text, user.id === _user.id]);
            data.push(["level", leaderboardInfo.userLevel, leaderboardInfo.member]);
            i++;
        });

        //Gets the position of the user if they are not in the top 15
        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === _user.id);
        if (index < 0) {
            const userLevel = levels.find(u => u.userId === _user.id);
            if (userLevel) {
                data.push(["..."]);
                const userIndex = levels.findIndex(u => u.userId === _user.id);
                let text = _user.tag;
                text = `${userIndex + 1}. ${text}`;
                data.push([text, member.id === _user.id]);
                data.push(["level", userLevel, member]);
            } else {
                return cmdArgs.message.reply(Localisation.getTranslation("error.null.userLevel"));
            }
        }

        const canvas = createCanvas(10, 10);
        const ctx = canvas.getContext("2d");

        const textFontSize = 80;
        const textFont = `${textFontSize}px ${CANVAS_FONT}`;

        const textSizes: number[] = [];

        ctx.font = textFont;
        data.forEach(value => {
            textSizes.push(ctx.measureText(value[0]).width);
        });

        let width = textSizes[0];
        textSizes.forEach(size => {
            if (size > width) width = size;
        });
        width = Math.max(width, 1500);

        const gapHeight = textFontSize / 4;

        const gapBetweenUsers = 10;
        const gapBetweenUserLevel = 2;

        let height = 0;
        ctx.font = textFont;
        i = 0;
        data.forEach(value => {
            const text: string = value[0];
            if (text !== "...")
                i++;
            height += textFontSize + gapBetweenUsers;
            if (i % 2 === 0 && text !== "...")
                height += gapHeight + gapBetweenUsers;
            if (text === "level")
                height += gapBetweenUserLevel;
        });

        canvas.width = width * 1.2;
        canvas.height = height;

        ctx.fillStyle = `#${serverInfo.leaderboardColor}`;
        roundRect(ctx, 0, 0, canvas.width, canvas.height, canvas.height * 0.01);

        let rgb = hexToRGB(serverInfo.leaderboardColor);
        let brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        const textColor = (brightness > 125) ? 'black' : 'white';

        const barWidth = canvas.width * 0.6;

        ctx.font = textFont;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "top";
        let textPos = -textFontSize - (textFontSize / 20);
        i = 0;
        await asyncForEach(data, async (value) => {
            const text: string = value[0];
            if (text !== "...")
                i++;
            if (value[1] === true)
                ctx.fillStyle = `#${serverInfo.leaderboardHighlight}`;
            textPos += textFontSize + gapBetweenUsers;
            if (text !== "level")
                ctx.fillText(text, 8, textPos);
            else {
                textPos += gapBetweenUserLevel;
                const userLevel: UserLevel = value[1];
                const member: GuildMember = value[2];
                const levelText = Localisation.getTranslation("leaderboard.output", userLevel.level);

                let userSettings = await UserSettings.get(member.id);
                if (!userSettings) {
                    userSettings = DEFAULT_USER_SETTING;
                    await UserSettings.set(member.id, userSettings);
                }

                const filled = userLevel.xp / getLevelXP(userLevel.level);

                const startRGB = hexToRGB(userSettings.barStartColor);
                const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

                const endRGB = hexToRGB(userSettings.barEndColor);
                const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

                ctx.fillText(levelText, 8, textPos);
                ctx.fillStyle = "#272822";
                const barPos = { x: ctx.measureText(levelText + " ").width + 8, y: textPos + (textFontSize / 7) };
                roundRect(ctx, barPos.x, barPos.y, barWidth, textFontSize, 20);

                //Draw Level bar
                ctx.fillStyle = `hsla(${blend(startHsl[0], endHsl[0], 1 - filled) * 360}, ${blend(startHsl[1], endHsl[1], 1 - filled) * 100}%, ${blend(startHsl[2], endHsl[2], 1 - filled) * 100}%, 1)`;
                ctx.save();
                roundRect(ctx, barPos.x, barPos.y, barWidth, textFontSize, 20, "clip");
                ctx.fillRect(barPos.x, barPos.y, barWidth * filled, textFontSize);
                ctx.restore();

                rgb = { r: blend(startRGB.r, endRGB.r, 1 - filled), g: blend(startRGB.g, endRGB.g, 1 - filled), b: blend(startRGB.b, endRGB.b, 1 - filled) };
                brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
                const levelColor = (brightness > 125) ? "black" : "white";

                //Draw level text
                ctx.save();
                ctx.beginPath();
                ctx.rect(barPos.x, barPos.y, barWidth * filled, textFontSize);
                ctx.clip();
                ctx.fillStyle = levelColor;
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), barPos.x + (barWidth / 2.0), barPos.y + (textFontSize * 0.5));
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.rect((barWidth * filled) + barPos.x, barPos.y, canvas.width, textFontSize);
                ctx.clip();
                ctx.fillStyle = "#ffffff";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), barPos.x + (barWidth / 2.0), barPos.y + (textFontSize * 0.5));
                ctx.restore();
            }
            ctx.fillStyle = textColor;
            if (i % 2 === 0 && text !== "...")
                textPos += gapHeight + gapBetweenUsers;
        });

        const endDate = new Date();
        console.log(secondsToTime((endDate.getTime() - startDate.getTime()) / 1000));

        cmdArgs.message.reply({ files: [canvasToMessageAttachment(canvas, "leaderboard")] });
    }
}

export = RankCommand;