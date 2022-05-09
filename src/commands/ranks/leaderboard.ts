import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, getLeaderboardMembers, asyncForEach, blend, canvasToMessageAttachment, hexToRGB, getBrightnessColor } from "../../utils/Utils";
import { getLevelXP } from "../../utils/XPUtils";
import { createCanvas, loadImage } from "canvas";
import { DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { roundRect, rgbToHsl, underlineText } from "../../utils/CanvasUtils";
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
        const msg = await cmdArgs.message.reply("Generating leaderboard...");

        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        if (!levels) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            user = temp;
        }
        if (user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = levels.findIndex(u => u.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: levels[i], member, position: i });
            } else {
                return cmdArgs.message.reply(Localisation.getTranslation("error.null.userLevel"));
            }
        }

        const pfpPadding = 10;
        const pfpRadius = 60;
        const borderThickness = 3;
        const newPfpRadius = pfpRadius - borderThickness;


        const textFontSize = 50;
        const textFont = `${textFontSize}px ${CANVAS_FONT}`;

        const separatorHeight = 10;

        const canvas = createCanvas(10, 10);
        const ctx = canvas.getContext("2d");

        const textSizes: number[] = [];

        ctx.font = textFont;
        leaderboardLevels.forEach((value) => {
            const levelText = Localisation.getTranslation("leaderboard.output", value.userLevel.level);
            textSizes.push(ctx.measureText(`${value.position + 1}. ${value.member.user.tag} ${levelText}`).width + ((pfpRadius + pfpPadding) + (pfpRadius + borderThickness + pfpPadding * 2)));
        });

        let width = textSizes[0];
        textSizes.forEach(size => {
            if (size > width) width = size;
        });
        width = Math.max(width, 1200);

        canvas.width = width;
        canvas.height = ((pfpPadding) * (leaderboardLevels.length + 1)) + (pfpRadius + pfpPadding) * (leaderboardLevels.length * 2);

        const colors: string[] = [];

        await asyncForEach(leaderboardLevels, async (value) => {
            let userSettings: UserSetting = await UserSettings.get(value.member.id);
            if (!userSettings) {
                userSettings = DEFAULT_USER_SETTING;
                await UserSettings.set(user.id, userSettings);
            }
            colors.push(userSettings.cardColor);
        });

        ctx.save();
        roundRect(ctx, 0, 0, canvas.width, canvas.height, canvas.height * 0.01, "clip");

        colors.forEach((color, i) => {
            let height = pfpRadius * 2 + pfpPadding;
            const yPos = ((pfpPadding) * (i + 1)) + (pfpRadius + pfpPadding) * (i * 2);
            if (i <= 0 || i >= colors.length - 1) {
                height += pfpPadding;
            }
            if (i >= colors.length - 1) {
                height += pfpPadding;
            }
            ctx.fillStyle = `#${color}`;
            ctx.fillRect(0, i <= 0 ? 0 : yPos, canvas.width, height);
            if (i >= 0 && i < colors.length - 1) {
                const grd = ctx.createLinearGradient(0, i <= 0 ? height : yPos + height, 0, (i <= 0 ? height : yPos + height) + 20);
                grd.addColorStop(0, `#${color}`);
                grd.addColorStop(1, `#${colors[i + 1]}`);
                ctx.fillStyle = grd;
                ctx.fillRect(0, i <= 0 ? height : yPos + height, canvas.width, 20);
            }
        });

        ctx.restore();

        let previousUserSettings: UserSetting;

        await asyncForEach(leaderboardLevels, async (value, i) => {
            let userSettings: UserSetting = await UserSettings.get(value.member.id);
            if (!userSettings) {
                userSettings = DEFAULT_USER_SETTING;
                await UserSettings.set(user.id, userSettings);
            }

            const pfpX = pfpRadius + pfpPadding;
            const pfpY = ((pfpPadding) * (i + 1)) + pfpRadius + (pfpRadius + pfpPadding) * (i * 2);

            const userLevel = value.userLevel;

            const levelText = Localisation.getTranslation("leaderboard.output", value.userLevel.level);

            const filled = userLevel.xp / getLevelXP(userLevel.level);

            const startRGB = hexToRGB(userSettings.barStartColor);
            const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

            const endRGB = hexToRGB(userSettings.barEndColor);
            const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

            const textColor = getBrightnessColor(hexToRGB(userSettings.cardColor));

            if (value.position >= 15) {
                ctx.fillStyle = getBrightnessColor(hexToRGB(previousUserSettings.cardColor));
                ctx.fillRect(0, pfpY - pfpRadius - pfpPadding - (separatorHeight / 2.), canvas.width, separatorHeight);
            }

            if (userSettings.specialCircleColor && userSettings.specialCircleColor !== DEFAULT_USER_SETTING.specialCircleColor) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(pfpX + borderThickness, pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
                ctx.strokeStyle = `#${userSettings.specialCircleColor}`;
                ctx.lineWidth = borderThickness * 2;
                ctx.stroke();
                ctx.restore();
            }

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
            ctx.lineWidth = borderThickness * 2;
            ctx.arc(pfpX + borderThickness, pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
            ctx.stroke();
            ctx.restore();

            //Draw Profile Picture
            ctx.save();
            ctx.beginPath();
            ctx.arc(pfpX + borderThickness, pfpY + borderThickness, newPfpRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatar = await loadImage(value.member.displayAvatarURL({ format: 'png' }));
            ctx.drawImage(avatar, pfpX - newPfpRadius + borderThickness, pfpY - newPfpRadius + borderThickness, newPfpRadius * 2, newPfpRadius * 2);
            ctx.restore();

            ctx.font = textFont;
            ctx.fillStyle = textColor;
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";

            const textPosx = pfpX + pfpRadius + borderThickness + pfpPadding * 2;
            const textPosY = pfpY;

            ctx.fillText(`${value.position + 1}. ${value.member.user.tag} ${levelText}`, textPosx, textPosY);
            if (user.id === value.member.id) {
                underlineText(ctx, `${value.position + 1}. ${value.member.user.tag} ${levelText}`, textPosx, textPosY);
            }

            previousUserSettings = userSettings;
        });

        cmdArgs.message.reply({ files: [canvasToMessageAttachment(canvas, "leaderboard")] });
        msg.delete();
    }
}

export = RankCommand;