import { createCanvas, loadImage, NodeCanvasRenderingContext2D } from "canvas";
import { Guild, GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { CANVAS_FONT } from "../Constants";
import { Localisation } from "../localisation";
import { DatabaseType } from "../structs/DatabaseTypes";
import { CustomNameUser } from "../structs/databaseTypes/CustomName";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { DEFAULT_USER_SETTING, UserSetting } from "../structs/databaseTypes/UserSetting";
import { rgbToHsl, fitTextOnCanvas, roundRect } from "./CanvasUtils";
import { capitalise } from "./FormatUtils";
import { getRoleById } from "./GetterUtils";
import { getWingsImageByLevel } from "./RankUtils";
import { getServerDatabase, asyncForEach, hexToRGB, blend, isHexColor } from "./Utils";
import { getLevelXP } from "./XPUtils";

function drawSpecialCircle(ctx: NodeCanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, radius * 2, radius * 2);
    ctx.restore();
}

export async function drawCard(leaderboardPosition: number, userLevel: UserLevel, userSettings: UserSetting, serverUserSettings: ServerUserSettings, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const levels: UserLevel[] = await getServerDatabase(Levels, guild.id);

    const CustomNames = BotUser.getDatabase(DatabaseType.CustomNames);

    levels.sort((a, b) => {
        if (a.level === b.level) {
            return b.xp - a.xp;
        }
        return b.level - a.level;
    });

    const user = member.user;

    let currentRankText = Localisation.getTranslation("generic.none");
    if (currentRank) {
        const role = await getRoleById(currentRank.roleId, guild);
        currentRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
    }
    currentRankText = Localisation.getTranslation("magiclevels.transformation.current", currentRankText);
    if (currentRank)
        currentRankText += ` ${Localisation.getTranslation("magiclevels.transformation.current.level", currentRank.level)}`;

    let nextRankText = Localisation.getTranslation("generic.none");
    if (nextRank) {
        const role = await getRoleById(nextRank.roleId, guild);
        nextRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
    }
    nextRankText = Localisation.getTranslation("magiclevels.transformation.next", nextRankText);
    if (nextRank)
        nextRankText += ` ${Localisation.getTranslation("magiclevels.transformation.next.level", nextRank.level)}`;

    const levelsText = Localisation.getTranslation("magiclevels.level", userLevel.level);
    const lbPositionText = Localisation.getTranslation("magiclevels.lb.position", leaderboardPosition);

    // Canvas

    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext("2d");

    const getCustomName = async () => {
        const customNames: string[] = await CustomNames.keys();
        const customNameUsers: CustomNameUser[][] = await CustomNames.values();
        let toReturn = user.username;

        await asyncForEach(customNameUsers, async (users, i) => {
            return await asyncForEach(users, u => {
                if (u.id === user.id) {
                    toReturn = customNames[i];
                    return true;
                }
            });
        });

        return toReturn;
        /*const customName = customNames.users.find(u => u.id === user.id);
        if (!customName)
            return user.username;
        if (customName.index >= customNames.names.length)
            return user.username;
        return customNames.names[customName.index];*/
    };

    const name = await getCustomName();

    const pfpRadius = 140;
    const nameFontSize = 60;
    const lbFontSize = 50;
    const borderThickness = 10;
    const newPfpRadius = pfpRadius - borderThickness;

    const filled = userLevel.xp / getLevelXP(userLevel.level);

    const startRGB = hexToRGB(userSettings.barStartColor);
    const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

    const endRGB = hexToRGB(userSettings.barEndColor);
    const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

    let rgb = hexToRGB(userSettings.cardColor);
    let brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    const textColor = (brightness > 125) ? 'black' : 'white';

    rgb = { r: blend(startRGB.r, endRGB.r, 1 - filled), g: blend(startRGB.g, endRGB.g, 1 - filled), b: blend(startRGB.b, endRGB.b, 1 - filled) };
    brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    const levelColor = (brightness > 125) ? "black" : "white";

    const namePosY = 5;

    const pfpX = (canvas.width / 2) - pfpRadius;
    const pfpY = (canvas.height / 2.3) - pfpRadius;

    const lbPosY = pfpY + (pfpRadius * 1.5);

    const barPosX = 10;
    const barPosY = lbPosY + lbFontSize + 20;

    const barHeight = canvas.height * 0.05;
    const barWidth = canvas.width - (barPosX * 2);
    const levelFont = `${barHeight}px ${CANVAS_FONT}`;

    const topTextHeight = barPosY + barHeight + 5;
    const extraInfoAmount = 2;

    const currentRankFontSize = fitTextOnCanvas(ctx, currentRankText, canvas.width);
    const nextRankFontSize = fitTextOnCanvas(ctx, nextRankText, canvas.width);
    const extraInfoFontSize = currentRankFontSize < nextRankFontSize ? currentRankFontSize : nextRankFontSize;

    const extraTextPosY = ((canvas.height - topTextHeight) / extraInfoAmount);

    //Draw background
    ctx.fillStyle = `#${userSettings.cardColor}`;
    roundRect(ctx, 0, 0, canvas.width, canvas.height, canvas.width * 0.01);

    //Draw Wings
    const wingsImage = await getWingsImageByLevel(serverUserSettings.wingsLevel < 0 ? userLevel.level : serverUserSettings.wingsLevel, userSettings.winxCharacter, guild.id);

    const oldMode = false;

    if (wingsImage) {
        ctx.drawImage(wingsImage, (canvas.width - wingsImage.width) / 2., oldMode ? (pfpY + borderThickness - wingsImage.height / 4.) : (((newPfpRadius + pfpY + borderThickness) - wingsImage.height / 2.)), wingsImage.width, wingsImage.height);
    }

    if (serverUserSettings.cardName === undefined) {
        serverUserSettings.cardName = true;
    }

    if (serverUserSettings.cardName) {
        //Draw name
        ctx.font = `${nameFontSize}px ${CANVAS_FONT}`;
        if (userSettings.nameColor === DEFAULT_USER_SETTING.nameColor || !isHexColor(userSettings.nameColor)) {
            if (member.roles && member.roles.color && member.roles.color.color) ctx.fillStyle = member.roles.color.hexColor;
        } else {
            ctx.fillStyle = `#${userSettings.nameColor}`;
        }
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(name, canvas.width / 2, namePosY);
        ctx.fillText(name, canvas.width / 2, namePosY);
    }

    //Draw Levels
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    ctx.font = `${lbFontSize}px ${CANVAS_FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(levelsText, barPosX, namePosY);

    //Draw Leaderboard Position
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    ctx.font = `${lbFontSize}px ${CANVAS_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(lbPositionText, barPosX + barWidth, namePosY);

    //Draw Level bar background
    /*ctx.fillStyle = "#272822";
    roundRect(ctx, barPosX, barPosY, barWidth, barHeight, 20);

    //Draw Level bar
    ctx.fillStyle = `hsla(${blend(startHsl[0], endHsl[0], 1 - filled) * 360}, ${blend(startHsl[1], endHsl[1], 1 - filled) * 100}%, ${blend(startHsl[2], endHsl[2], 1 - filled) * 100}%, 1)`;
    ctx.save();
    roundRect(ctx, barPosX, barPosY, barWidth, barHeight, 20, "clip");
    ctx.fillRect(barPosX, barPosY, barWidth * filled, barHeight);
    ctx.restore();

    //Draw level text
    ctx.save();
    ctx.beginPath();
    ctx.rect(barPosX, barPosY, barWidth * filled, barHeight);
    ctx.clip();
    ctx.font = levelFont;
    ctx.fillStyle = levelColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (barPosX) + (barWidth / 2.0), barPosY + (barHeight * 0.5));
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect((barWidth * filled) + barPosX, barPosY, canvas.width, barHeight);
    ctx.clip();
    ctx.font = levelFont;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (barPosX) + (barWidth / 2.0), barPosY + (barHeight * 0.5));
    ctx.restore();*/

    ctx.font = levelFont;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (canvas.width / 2.0), pfpY + (borderThickness * 2 + pfpRadius) * 2);

    ctx.font = `${extraInfoFontSize}px ${CANVAS_FONT}`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.fillText(currentRankText, canvas.width / 2, barPosY + barHeight + extraTextPosY);

    ctx.fillText(nextRankText, canvas.width / 2, barPosY + barHeight + (extraTextPosY * 2));

    //drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, `#${userSettings.specialCircleColor || DEFAULT_USER_SETTING.specialCircleColor}`);

    if (userSettings.specialCircleColor && userSettings.specialCircleColor !== DEFAULT_USER_SETTING.specialCircleColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
        ctx.strokeStyle = `#${userSettings.specialCircleColor}`;
        ctx.lineWidth = borderThickness * 2;
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${blend(startHsl[0], endHsl[0], 1 - filled) * 360}, ${blend(startHsl[1], endHsl[1], 1 - filled) * 100}%, ${blend(startHsl[2], endHsl[2], 1 - filled) * 100}%, 1)`;
    ctx.lineWidth = borderThickness * 2;
    ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
    ctx.stroke();
    ctx.restore();

    //Draw Profile Picture
    ctx.save();
    ctx.beginPath();
    ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, newPfpRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(member.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, pfpX + borderThickness, pfpY + borderThickness, newPfpRadius * 2, newPfpRadius * 2);
    ctx.restore();

    return canvas;
}