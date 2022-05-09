import { Canvas, createCanvas, createImageData, Image, loadImage } from "canvas";
import decodeGif from "decode-gif";
import { Guild, GuildMember } from "discord.js";
import { get } from "https";
import { BotUser } from "../BotClient";
import { CANVAS_FONT } from "../Constants";
import GIFEncoder, { applyPalette, quantize } from "../gifenc/gifenc";
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
import { getServerDatabase, asyncForEach, hexToRGB, blend, isHexColor, getBrightnessColor, stream2buffer, toBuffer } from "./Utils";
import { getLevelXP } from "./XPUtils";

export async function drawCard(leaderboardPosition: number, userLevel: UserLevel, userSettings: UserSetting, serverUserSettings: ServerUserSettings, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
    const wingsImage = await getWingsImageByLevel(serverUserSettings.wingsLevel < 0 ? userLevel.level : serverUserSettings.wingsLevel, userSettings.winxCharacter, guild.id);

    return drawCardWithWings(leaderboardPosition, userLevel, userSettings, serverUserSettings, wingsImage, currentRank, nextRank, member, guild);
}

export async function drawCardWithWings(leaderboardPosition: number, userLevel: UserLevel, userSettings: UserSetting, serverUserSettings: ServerUserSettings, wingsImage: string | Buffer | Image, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
    const userPfpUrl = member.displayAvatarURL({ dynamic: true });

    if (serverUserSettings.animatedCard == undefined) {
        serverUserSettings.animatedCard = true;
    }

    if (userPfpUrl.toLocaleLowerCase().endsWith(".gif") && serverUserSettings.animatedCard) {

        return new Promise<Buffer>((resolve) => {

            get(member.displayAvatarURL({ format: "gif" }), async (response) => {
                const buffer = await stream2buffer(response);

                const { width, height, frames } = decodeGif(buffer);

                const gif = GIFEncoder();

                await asyncForEach(frames, async (frame) => {
                    const pfpCanvas = createCanvas(width, height);
                    const pfpCtx = pfpCanvas.getContext("2d");

                    const data = createImageData(frame.data, width, height);
                    pfpCtx.putImageData(data, 0, 0);

                    const canvas = await drawCardFrame(pfpCanvas, leaderboardPosition, userLevel, userSettings, serverUserSettings, wingsImage, currentRank, nextRank, member, guild);
                    const ctx = canvas.getContext("2d");

                    const array = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    const palette = quantize(array.data, 256);
                    const index = applyPalette(array.data, palette);

                    gif.writeFrame(index, array.width, array.height, { palette, transparent: true });
                });

                gif.finish();

                resolve(toBuffer(gif.buffer));
            });
        }).then(buffer => { return { image: buffer, extension: "gif" }; });
    } else {
        const avatar = await loadImage(member.displayAvatarURL({ format: 'png' }));
        return { image: (await drawCardFrame(avatar, leaderboardPosition, userLevel, userSettings, serverUserSettings, wingsImage, currentRank, nextRank, member, guild)).toBuffer(), extension: "png" };
    }
}

async function drawCardFrame(userAvatar: Image | Canvas, leaderboardPosition: number, userLevel: UserLevel, userSettings: UserSetting, serverUserSettings: ServerUserSettings, wingsImage: string | Buffer | Image, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
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

    const textColor = getBrightnessColor(hexToRGB(userSettings.cardColor));

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

    let wings: Image;

    //Draw Wings
    if (typeof (wingsImage) === "string" || Buffer.isBuffer(wingsImage)) {
        wings = await loadImage(wingsImage);
    } else {
        wings = wingsImage;
    }

    if (wings) {
        ctx.drawImage(wings, (canvas.width - wings.width) / 2., ((newPfpRadius + pfpY + borderThickness) - wings.height / 2.), wings.width, wings.height);
    }

    if (serverUserSettings.cardName === undefined) {
        serverUserSettings.cardName = "NICKNAME";
    }

    if (serverUserSettings.cardName !== "DISABLED") {

        const getCustomName = async () => {
            const customNames: string[] = await CustomNames.keys();
            const customNameUsers: CustomNameUser[][] = await CustomNames.values();
            let toReturn = serverUserSettings.cardName === "NICKNAME" ? (member.nickname || user.username) : user.username;

            await asyncForEach(customNameUsers, async (users, i) => {
                return await asyncForEach(users, u => {
                    if (u.id === user.id) {
                        toReturn = customNames[i];
                        return true;
                    }
                });
            });

            return toReturn;
        };

        const userName = await getCustomName();

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
        ctx.strokeText(userName, canvas.width / 2, namePosY);
        ctx.fillText(userName, canvas.width / 2, namePosY);
    }

    //Draw Levels
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    ctx.font = `${lbFontSize}px ${CANVAS_FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(levelsText, barPosX, namePosY);
    const metrics = ctx.measureText(levelsText);
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    ctx.font = levelFont;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), barPosX + (metrics.width / 2.), namePosY + (actualHeight * 1.4));

    //Draw Leaderboard Position
    ctx.textBaseline = "top";
    ctx.fillStyle = textColor;
    ctx.font = `${lbFontSize}px ${CANVAS_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(lbPositionText, barPosX + barWidth, namePosY);

    ctx.font = `${extraInfoFontSize}px ${CANVAS_FONT}`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.fillText(currentRankText, canvas.width / 2, barPosY + barHeight + extraTextPosY);

    ctx.fillText(nextRankText, canvas.width / 2, barPosY + barHeight + (extraTextPosY * 2));

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
    ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
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

    ctx.drawImage(userAvatar, pfpX + borderThickness, pfpY + borderThickness, newPfpRadius * 2, newPfpRadius * 2);
    ctx.restore();

    return canvas;
}