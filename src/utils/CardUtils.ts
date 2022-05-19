import { Canvas, createCanvas, createImageData, Image, loadImage } from "canvas";
import decodeGif from "decode-gif";
import { Guild, GuildMember, User } from "discord.js";
import { existsSync } from "fs";
import { get } from "https";
import { BotUser } from "../BotClient";
import { CANVAS_FONT, CARD_TEMPLATES_FOLDER, LB_USERS } from "../Constants";
import GIFEncoder, { applyPalette, quantize } from "../gifenc/gifenc";
import { Localisation } from "../localisation";
import { DatabaseType } from "../structs/DatabaseTypes";
import { CustomNameUser } from "../structs/databaseTypes/CustomName";
import { CustomWings } from "../structs/databaseTypes/CustomWings";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { CardTemplate, ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { rgbToHsl, fitTextOnCanvas, roundRect, underlineText } from "./CanvasUtils";
import { capitalise } from "./FormatUtils";
import { getRoleById } from "./GetterUtils";
import { getWingsImageByLevel } from "./RankUtils";
import { getServerDatabase, asyncForEach, hexToRGB, blend, isHexColor, getBrightnessColor, stream2buffer, toBuffer, isPatreon, isBooster } from "./Utils";
import { getLevelXP } from "./XPUtils";

export async function drawCard(leaderboardPosition: number, userLevel: UserLevel, serverUserSettings: ServerUserSettings, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
    const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
    const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, guild.id);

    if (serverUserSettings.cardWings === undefined)
        serverUserSettings.cardWings = "ENABLED";

    const wings = customWings.find(w => w.userId === member.id);
    let wingsImage: Image;
    if (wings && existsSync(wings.wingsFile) && serverUserSettings.cardWings === "CUSTOM" && ((await isPatreon(member.id, guild.id)) || isBooster(member))) {
        wingsImage = await loadImage(wings.wingsFile);
    }

    if (serverUserSettings.wingsLevelB === undefined)
        serverUserSettings.wingsLevelB = -1;

    const wingsImageA = await getWingsImageByLevel(serverUserSettings.wingsLevel < 0 ? userLevel.level : serverUserSettings.wingsLevel, serverUserSettings.winxCharacter, guild.id);
    const wingsImageB = await getWingsImageByLevel(serverUserSettings.wingsLevelB < 0 ? userLevel.level : serverUserSettings.wingsLevelB, serverUserSettings.winxCharacterB ?? serverUserSettings.winxCharacter, guild.id);

    return drawCardWithWings(leaderboardPosition, userLevel, serverUserSettings, wingsImage ?? wingsImageA, wingsImage ?? wingsImageB, currentRank, nextRank, member, guild);
}

export async function drawCardWithWings(leaderboardPosition: number, userLevel: UserLevel, serverUserSettings: ServerUserSettings, wingsImageA: string | Buffer | Image, wingsImageB: string | Buffer | Image, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
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

                    const canvas = await drawCardFrame(pfpCanvas, leaderboardPosition, userLevel, serverUserSettings, wingsImageA, wingsImageB, currentRank, nextRank, member, guild);
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
        return { image: (await drawCardFrame(avatar, leaderboardPosition, userLevel, serverUserSettings, wingsImageA, wingsImageB, currentRank, nextRank, member, guild)).toBuffer(), extension: "png" };
    }
}

async function drawCardFrame(userAvatar: Image | Canvas, leaderboardPosition: number, userLevel: UserLevel, serverUserSettings: ServerUserSettings, wingsImageA: string | Buffer | Image, wingsImageB: string | Buffer | Image, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
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

    if (serverUserSettings.wingsTemplate === undefined)
        serverUserSettings.wingsTemplate = CardTemplate.Normal;

    if (serverUserSettings.cardTemplate === undefined)
        serverUserSettings.cardTemplate = CardTemplate.Normal;

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

    const startRGB = hexToRGB(serverUserSettings.barStartColor);
    const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

    const endRGB = hexToRGB(serverUserSettings.barEndColor);
    const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

    const textColor = getBrightnessColor(hexToRGB(serverUserSettings.cardColor));

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

    let cardTemplateImage: Image;

    const cardTemplatePath = `${CARD_TEMPLATES_FOLDER}/${serverUserSettings.cardTemplate}.png`;

    if (existsSync(cardTemplatePath)) {
        cardTemplateImage = await loadImage(cardTemplatePath);
    }

    //Draw background

    if (cardTemplateImage) {
        const tempCanvas = createCanvas(canvas.width, canvas.height);
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.fillStyle = `#${serverUserSettings.cardColor}`;
        roundRect(tempCtx, 0, 0, canvas.width, canvas.height, canvas.width * 0.01);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-in"), 0, 0);

        tempCtx.clearRect(0, 0, canvas.width, canvas.height);

        if (serverUserSettings.cardColorB === undefined) {
            serverUserSettings.cardColorB = new ServerUserSettings(user.id).cardColorB;
        }

        tempCtx.fillStyle = `#${serverUserSettings.cardColorB}`;
        roundRect(tempCtx, 0, 0, canvas.width, canvas.height, canvas.width * 0.01);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-out"), 0, 0);
    } else {
        ctx.fillStyle = `#${serverUserSettings.cardColor}`;
        roundRect(ctx, 0, 0, canvas.width, canvas.height, canvas.width * 0.01);
    }

    const wingsImages: Image[] = [];
    let wingsTemplateImage: Image;

    const wingsTemplatePath = `${CARD_TEMPLATES_FOLDER}/${serverUserSettings.wingsTemplate}.png`;

    if (existsSync(wingsTemplatePath)) {
        wingsTemplateImage = await loadImage(wingsTemplatePath);
    }

    //Draw Wings
    if (typeof (wingsImageA) === "string" || Buffer.isBuffer(wingsImageA)) {
        wingsImages.push(await loadImage(wingsImageA));
    } else {
        wingsImages.push(wingsImageA);
    }

    if (typeof (wingsImageB) === "string" || Buffer.isBuffer(wingsImageB)) {
        wingsImages.push(await loadImage(wingsImageB));
    } else {
        wingsImages.push(wingsImageB);
    }

    if (wingsImages.length >= 2) {
        if (wingsImages[0]) {
            const wings = wingsImages[0];
            const wingsX = (canvas.width - wings.width) / 2.;
            const wingsY = ((newPfpRadius + pfpY + borderThickness) - wings.height / 2.);

            if (!wingsTemplateImage) {
                ctx.drawImage(wings, wingsX, wingsY);
            }
            else {
                ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-in"), wingsX, wingsY);
            }
        }

        if (wingsImages[1]) {
            const wings = wingsImages[1];
            const wingsX = (canvas.width - wings.width) / 2.;
            const wingsY = ((newPfpRadius + pfpY + borderThickness) - wings.height / 2.);

            if (!wingsTemplateImage) {
                ctx.drawImage(wings, wingsX, wingsY);
            }
            else {
                ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-out"), wingsX, wingsY);
            }
        }
    } else if (wingsImages.length) {
        const wings = wingsImages[0];
        const wingsX = (canvas.width - wings.width) / 2.;
        const wingsY = ((newPfpRadius + pfpY + borderThickness) - wings.height / 2.);

        ctx.drawImage(wings, wingsX, wingsY);
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
        if (serverUserSettings.nameColor === new ServerUserSettings(user.id).nameColor || !isHexColor(serverUserSettings.nameColor)) {
            if (member.roles && member.roles.color && member.roles.color.color) ctx.fillStyle = member.roles.color.hexColor;
        } else {
            ctx.fillStyle = `#${serverUserSettings.nameColor}`;
        }
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.strokeStyle = 'black';
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

    if (serverUserSettings.specialCircleColor && serverUserSettings.specialCircleColor !== new ServerUserSettings(user.id).specialCircleColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
        ctx.strokeStyle = `#${serverUserSettings.specialCircleColor}`;
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

export async function drawTemplateCard(member: GuildMember) {
    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext("2d");

    const pfpRadius = 140;
    const borderThickness = 10;
    const newPfpRadius = pfpRadius - borderThickness;

    const pfpX = (canvas.width / 2) - pfpRadius;
    const pfpY = (canvas.height / 2.3) - pfpRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, pfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
    ctx.strokeStyle = `#ffffff`;
    ctx.lineWidth = borderThickness * 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(newPfpRadius + pfpX + borderThickness, newPfpRadius + pfpY + borderThickness, newPfpRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const userAvatar = await loadImage(member.displayAvatarURL({ format: "png" }));

    ctx.drawImage(userAvatar, pfpX + borderThickness, pfpY + borderThickness, newPfpRadius * 2, newPfpRadius * 2);
    ctx.restore();

    return canvas;
}

export async function drawLeaderboard(leaderboardLevels: { userLevel: UserLevel, member: GuildMember, position: number }[], user: User, guildId: string) {
    const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
    const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, guildId);

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
        let userSettings = serverUserSettings.find(s => s.userId === value.member.id);
        if (!userSettings) {
            userSettings = new ServerUserSettings(value.member.id);
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

    let previousUserSettings: ServerUserSettings;

    await asyncForEach(leaderboardLevels, async (value, i) => {
        let userSettings = serverUserSettings.find(s => s.userId === value.member.id);
        if (!userSettings) {
            userSettings = new ServerUserSettings(value.member.id);
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

        if (value.position >= LB_USERS) {
            ctx.fillStyle = getBrightnessColor(hexToRGB(previousUserSettings.cardColor));
            ctx.fillRect(0, pfpY - pfpRadius - pfpPadding - (separatorHeight / 2.), canvas.width, separatorHeight);
        }

        if (userSettings.specialCircleColor && userSettings.specialCircleColor !== new ServerUserSettings(value.member.id).specialCircleColor) {
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

    return canvas;
}

function drawMaskedImage(mask: Image, image: Image | Canvas, globalCompositeOperation: "source-in" | "source-out") {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = globalCompositeOperation;

    ctx.drawImage(image, 0, 0);

    return canvas;
}