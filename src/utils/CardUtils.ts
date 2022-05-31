import { Canvas, createCanvas, createImageData, Image, loadImage, NodeCanvasRenderingContext2D } from "canvas";
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
import { CardTemplate, DEFAULT_CARD_CODE, ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { rgbToHsl, fitTextOnCanvas, roundRect, underlineText } from "./CanvasUtils";
import { capitalise } from "./FormatUtils";
import { getRoleById } from "./GetterUtils";
import { getWingsImageByLevel } from "./RankUtils";
import { getServerDatabase, asyncForEach, hexToRGB, blend, isHexColor, getBrightnessColor, stream2buffer, toBuffer, isPatreon, isBooster } from "./Utils";
import { getLevelXP } from "./XPUtils";

// Canvas
const cardCanvasWidth = 1200;
const cardCanvasHeight = 600;

// Pfp
// const cardPfpRadius = 140;
// const cardPfpX = (cardCanvasWidth / 2) - cardPfpRadius;
// const cardPfpY = (cardCanvasHeight / 2.3) - cardPfpRadius;
// const cardBorderThickness = 10;
// const cardNewPfpRadius = cardPfpRadius - cardBorderThickness;

// // Name
// const cardNameFontSize = 60;
// const cardNamePosY = 5;
// const cardNamePosX = cardCanvasWidth / 2;

// // Top Info
// const cardTopInfoFontSize = 50;
// const cardLevelPosX = 10;
// const cardRankPosX = cardCanvasWidth - cardLevelPosX;
// const cardXPFontSize = cardTopInfoFontSize / 1.5;
// const cardLevelFont = `${cardXPFontSize}px ${CANVAS_FONT}`;

// // Extra Info
// const cardExtraInfoAmount = 2;
// const cardExtraTextStartPosY = cardPfpY + (cardPfpRadius * 2.25);
// const cardExtraTextPosY = ((cardCanvasHeight - cardExtraTextStartPosY) / cardExtraInfoAmount);

export function decodeCode(code: string) {
    if (!code) return decodeCode(DEFAULT_CARD_CODE);

    const codeParts = code.split("|");

    if (codeParts.length <= 1) {
        return decodeCode(DEFAULT_CARD_CODE);
    }

    const toReturn = {};

    codeParts.forEach(codePart => {
        const parts = codePart.split("=");
        toReturn[parts.shift()] = parts.join("=");
    });

    return toReturn;
}

export async function drawCard(leaderboardPosition: number, userLevel: UserLevel, serverUserSettings: ServerUserSettings, currentRank: RankLevel, nextRank: RankLevel, member: GuildMember, guild: Guild) {
    const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
    const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, guild.id);

    if (serverUserSettings.cardWings === undefined)
        serverUserSettings.cardWings = "ENABLED";

    const { wings_type } = decodeCode(serverUserSettings.cardCode);

    const wings = customWings.find(w => w.userId === member.id);
    let wingsImage: Image;
    if (wings && existsSync(wings.wingsFile) && (wings_type ?? "default") === "custom" && ((await isPatreon(member.id, guild.id)) || isBooster(member))) {
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
    const canvas = createCanvas(cardCanvasWidth, cardCanvasHeight);
    const ctx = canvas.getContext("2d");

    const decodedCode = decodeCode(serverUserSettings.cardCode);

    const { cl_background, cl_wings, cl_pfp, cl_xpBar, cl_pfpCircle, cl_nextTransformation, cl_currentTransformation, cl_rank, cl_xp, cl_level, cl_name } = decodedCode;

    const varToString = (varObj) => Object.keys(varObj)[0];

    const layers: { varName: string, layer: number }[] = [
        { varName: varToString({ cl_background }), layer: cl_background },
        { varName: varToString({ cl_wings }), layer: cl_wings },
        { varName: varToString({ cl_pfp }), layer: cl_pfp },
        { varName: varToString({ cl_xpBar }), layer: cl_xpBar },
        { varName: varToString({ cl_pfpCircle }), layer: cl_pfpCircle },
        { varName: varToString({ cl_nextTransformation }), layer: cl_nextTransformation },
        { varName: varToString({ cl_currentTransformation }), layer: cl_currentTransformation },
        { varName: varToString({ cl_rank }), layer: cl_rank },
        { varName: varToString({ cl_xp }), layer: cl_xp },
        { varName: varToString({ cl_level }), layer: cl_level },
        { varName: varToString({ cl_name }), layer: cl_name }];

    layers.sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));

    const drawFuncs = {
        "cl_background": drawCardBackground,
        "cl_wings": drawCardWings,
        "cl_pfp": drawCardPfp,
        "cl_xpBar": drawCardXPBar,
        "cl_pfpCircle": drawCardPfpCircle,
        "cl_nextTransformation": drawCardNextTransformation,
        "cl_currentTransformation": drawCardCurrentTransformation,
        "cl_rank": drawCardRank,
        "cl_xp": drawCardXP,
        "cl_level": drawCardLevel,
        "cl_name": drawCardName,
    };

    const data = { wingsImageA, wingsImageB, member, guild, userLevel, currentRank, nextRank, leaderboardPosition, userAvatar };

    await asyncForEach(layers, async (layer) => {
        if (layer.layer === undefined) return;
        const func = drawFuncs[layer.varName];
        if (func && typeof func === "function") {
            await func(ctx, decodedCode, data);
        }
    });

    //if (cl_background !== undefined) {
    // await _drawCardBackground(ctx, serverUserSettings);
    // //}
    // //if (cl_cardWings !== undefined) {
    // await drawCardWings(ctx, wingsImageA, wingsImageB, serverUserSettings);
    // //}
    // await drawCardName(ctx, member, serverUserSettings);
    // await drawCardInfoText(ctx, guild, userLevel, serverUserSettings, currentRank, nextRank, leaderboardPosition);
    // await drawCardXPCircle(ctx, serverUserSettings, userLevel);
    // await drawCardPfp(ctx, userAvatar);

    return canvas;
}

export async function drawTemplateCard(member: GuildMember) {
    const serverUserSettings = new ServerUserSettings(member.id);
    serverUserSettings.specialCircleColor = "ffffff";

    const userLevel = new UserLevel(member.id);

    serverUserSettings.cardCode = "pfpCircle_width=10|pfpCircle_color=#ffffff|pfp_positionX=600|pfp_positionY=260|pfp_size=1|cl_pfpCircle=4|cl_pfp=5";

    return drawCardFrame(await loadImage(member.displayAvatarURL({ format: "png" })), 0, userLevel, serverUserSettings, undefined, undefined, undefined, undefined, member, member.guild);
}

async function drawCardBackground(ctx: NodeCanvasRenderingContext2D, decodedCode) {
    const { background_primaryColor, background_secondaryColor } = decodedCode;
    let { background_cardTemplate, background_round } = decodedCode;

    background_round /= 100;

    if (background_cardTemplate === undefined)
        background_cardTemplate = CardTemplate.Normal;

    let cardTemplateImage: Image;

    const cardTemplatePath = `${CARD_TEMPLATES_FOLDER}/${background_cardTemplate}.png`;

    if (existsSync(cardTemplatePath)) {
        cardTemplateImage = await loadImage(cardTemplatePath);
    }

    //Draw background

    if (cardTemplateImage) {
        const tempCanvas = createCanvas(cardCanvasWidth, cardCanvasHeight);
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.fillStyle = `${background_primaryColor}`;
        roundRect(tempCtx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-in"), 0, 0);

        tempCtx.clearRect(0, 0, cardCanvasWidth, cardCanvasHeight);

        tempCtx.fillStyle = `${background_secondaryColor}`;
        roundRect(tempCtx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-out"), 0, 0);
    } else {
        ctx.fillStyle = `${background_primaryColor}`;
        roundRect(ctx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);
    }
}

async function drawCardWings(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { followPfp, pfp_positionX, pfp_positionY } = decodedCode;
    let { wings_positionX, wings_positionY, wings_template } = decodedCode;

    if (followPfp) {
        if (pfp_positionX !== undefined)
            wings_positionX = pfp_positionX;
        if (pfp_positionY !== undefined)
            wings_positionY = pfp_positionY;
    }

    const { wingsImageA, wingsImageB } = data;

    if (wings_template === undefined) {
        wings_template = CardTemplate.Normal;
    }

    const wingsImages: Image[] = [];
    let wingsTemplateImage: Image;

    const wingsTemplatePath = `${CARD_TEMPLATES_FOLDER}/${wings_template}.png`;

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

    const drawWings = (wingsImage: Image, templateImage: Image, globalCompositeOperation: "source-in" | "source-out") => {
        const wingsX = wings_positionX - wingsImage.width / 2.;
        // const wingsY = ((pfpRadius + (canvasHeight / 2.3) - pfpRadius) - wingsImage.height / 2.);
        const wingsY = wings_positionY - wingsImage.height / 2.;

        if (!templateImage) {
            ctx.drawImage(wingsImage, wingsX, wingsY);
        }
        else {
            ctx.drawImage(drawMaskedImage(templateImage, wingsImage, globalCompositeOperation), wingsX, wingsY);
        }
    };

    if (wingsImages.length >= 2) {
        if (wingsImages[0]) {
            drawWings(wingsImages[0], wingsTemplateImage, "source-in");
            // const wings = wingsImages[0];
            // const wingsX = (cardCanvasWidth - wings.width) / 2.;
            // const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

            // if (!wingsTemplateImage) {
            //     ctx.drawImage(wings, wingsX, wingsY);
            // }
            // else {
            //     ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-in"), wingsX, wingsY);
            // }
        }

        if (wingsImages[1]) {
            drawWings(wingsImages[1], wingsTemplateImage, "source-out");
            // const wings = wingsImages[1];
            // const wingsX = (cardCanvasWidth - wings.width) / 2.;
            // const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

            // if (!wingsTemplateImage) {
            //     ctx.drawImage(wings, wingsX, wingsY);
            // }
            // else {
            //     ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-out"), wingsX, wingsY);
            // }
        }
    } else if (wingsImages[0]) {
        // const wings = wingsImages[0];
        // const wingsX = (cardCanvasWidth - wings.width) / 2.;
        // const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

        // ctx.drawImage(wings, wingsX, wingsY);
        drawWings(wingsImages[0], null, "source-in");
    }
}

async function drawCardPfp(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { pfp_positionX, pfp_positionY, pfp_size } = decodedCode;

    const { userAvatar } = data;

    const pfpRadius = 130 * pfp_size;
    const cardPfpX = pfp_positionX - pfpRadius;
    const cardPfpY = pfp_positionY - pfpRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pfpRadius + cardPfpX, pfpRadius + cardPfpY, pfpRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(userAvatar, cardPfpX, cardPfpY, pfpRadius * 2, pfpRadius * 2);
    ctx.restore();
}

async function drawCardXPBar(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { xpBar_startColor, xpBar_endColor, pfp_size, pfp_positionX, pfp_positionY } = decodedCode;
    let { xpBar_width } = decodedCode;

    const { userLevel } = data;

    xpBar_width = parseInt(xpBar_width);

    const filled = userLevel.xp / getLevelXP(userLevel.level);

    const startRGB = hexToRGB(xpBar_startColor);
    const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

    const endRGB = hexToRGB(xpBar_endColor);
    const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

    const pfpRadius = 130 * pfp_size;
    const cardPfpX = pfp_positionX - pfpRadius;
    const cardPfpY = pfp_positionY - pfpRadius;

    // if (serverUserSettings.specialCircleColor && serverUserSettings.specialCircleColor !== new ServerUserSettings("").specialCircleColor) {
    //     ctx.save();
    //     ctx.beginPath();
    //     ctx.arc(cardNewPfpRadius + cardPfpX + cardBorderThickness, cardNewPfpRadius + cardPfpY + cardBorderThickness, cardPfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
    //     ctx.strokeStyle = `#${serverUserSettings.specialCircleColor}`;
    //     ctx.lineWidth = cardBorderThickness * 2;
    //     ctx.stroke();
    //     ctx.restore();
    // }

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
    ctx.lineWidth = xpBar_width * 2;
    ctx.arc(pfpRadius + cardPfpX, pfpRadius + cardPfpY, pfpRadius + xpBar_width, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
    ctx.stroke();
    ctx.restore();
}

async function drawCardPfpCircle(ctx: NodeCanvasRenderingContext2D, decodedCode) {
    const { pfpCircle_color, pfp_size, pfp_positionX, pfp_positionY } = decodedCode;

    let { pfpCircle_width } = decodedCode;

    pfpCircle_width = parseInt(pfpCircle_width);

    const pfpRadius = 130 * pfp_size;
    const cardPfpX = pfp_positionX - pfpRadius;
    const cardPfpY = pfp_positionY - pfpRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pfpRadius + cardPfpX, pfpRadius + cardPfpY, pfpRadius + pfpCircle_width, 0, 360);
    ctx.strokeStyle = pfpCircle_color;
    ctx.lineWidth = pfpCircle_width * 2;
    ctx.stroke();
    ctx.restore();
}

async function drawCardName(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { name_nameType, name_matchRole, name_textColor, name_textAlign, name_textBaseline, name_textSize, name_positionX, name_positionY, name_strokeColor, name_strokeSize } = decodedCode;

    const { member } = data;

    const CustomNames = BotUser.getDatabase(DatabaseType.CustomNames);
    const user = member.user;

    const getCustomName = async () => {
        const customNames: string[] = await CustomNames.keys();
        const customNameUsers: CustomNameUser[][] = await CustomNames.values();
        let toReturn = name_nameType === "nickname" ? (member.nickname || user.username) : user.username;

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

    const cardNameFontSize = 60 * name_textSize;

    //Draw name
    ctx.font = `${cardNameFontSize}px ${CANVAS_FONT}`;
    if ((name_matchRole === "true" || !isHexColor(name_textColor)) && (member.roles && member.roles.color && member.roles.color.color)) {
        ctx.fillStyle = member.roles.color.hexColor;
    } else {
        ctx.fillStyle = name_textColor;
    }

    ctx.textBaseline = name_textBaseline;
    ctx.textAlign = name_textAlign;

    if (name_strokeSize > 0) {
        ctx.strokeStyle = name_strokeColor;
        ctx.lineWidth = name_strokeSize;
        ctx.strokeText(userName, name_positionX, name_positionY);
    }
    ctx.fillText(userName, name_positionX, name_positionY);
}

async function drawCardNextTransformation(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { nextTransformation_positionX, nextTransformation_positionY, nextTransformation_textColor, nextTransformation_strokeColor, nextTransformation_strokeSize, nextTransformation_textAlign, nextTransformation_textBaseline } = decodedCode;

    const { nextRank, guild } = data;

    let nextRankText = Localisation.getTranslation("generic.none");
    if (nextRank) {
        const role = await getRoleById(nextRank.roleId, guild);
        nextRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
    }
    nextRankText = Localisation.getTranslation("magiclevels.transformation.next", nextRankText);
    if (nextRank)
        nextRankText += ` ${Localisation.getTranslation("magiclevels.transformation.next.level", nextRank.level)}`;

    const fontSize = fitTextOnCanvas(ctx, nextRankText, cardCanvasWidth);

    ctx.font = `${fontSize}px ${CANVAS_FONT}`;
    ctx.textBaseline = nextTransformation_textBaseline;
    ctx.textAlign = nextTransformation_textAlign;
    ctx.fillStyle = nextTransformation_textColor;

    if (nextTransformation_strokeSize > 0) {
        ctx.strokeStyle = nextTransformation_strokeColor;
        ctx.lineWidth = nextTransformation_strokeSize;
        ctx.strokeText(nextRankText, nextTransformation_positionX, nextTransformation_positionY);
    }

    ctx.fillText(nextRankText, nextTransformation_positionX, nextTransformation_positionY);
}

async function drawCardCurrentTransformation(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { currentTransformation_positionX, currentTransformation_positionY, currentTransformation_textColor, currentTransformation_strokeColor, currentTransformation_strokeSize, currentTransformation_textAlign, currentTransformation_textBaseline } = decodedCode;

    const { currentRank, guild } = data;

    let currentRankText = Localisation.getTranslation("generic.none");
    if (currentRank) {
        const role = await getRoleById(currentRank.roleId, guild);
        currentRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
    }
    currentRankText = Localisation.getTranslation("magiclevels.transformation.current", currentRankText);
    if (currentRank)
        currentRankText += ` ${Localisation.getTranslation("magiclevels.transformation.current.level", currentRank.level)}`;

    const fontSize = fitTextOnCanvas(ctx, currentRankText, cardCanvasWidth);

    ctx.font = `${fontSize}px ${CANVAS_FONT}`;
    ctx.textBaseline = currentTransformation_textBaseline;
    ctx.textAlign = currentTransformation_textAlign;
    ctx.fillStyle = currentTransformation_textColor;

    if (currentTransformation_strokeSize > 0) {
        ctx.strokeStyle = currentTransformation_strokeColor;
        ctx.lineWidth = currentTransformation_strokeSize;
        ctx.strokeText(currentRankText, currentTransformation_positionX, currentTransformation_positionY);
    }

    ctx.fillText(currentRankText, currentTransformation_positionX, currentTransformation_positionY);
}

async function drawCardRank(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {

    const { rank_positionX, rank_positionY, rank_strokeColor, rank_strokeSize, rank_textAlign, rank_textBaseline, rank_textColor, rank_textSize } = decodedCode;

    const { leaderboardPosition } = data;

    const lbPositionText = Localisation.getTranslation("magiclevels.lb.position", leaderboardPosition);

    const cardTopInfoFontSize = 50 * rank_textSize;

    ctx.font = `${cardTopInfoFontSize}px ${CANVAS_FONT}`;

    ctx.textBaseline = rank_textBaseline;
    ctx.textAlign = rank_textAlign;
    ctx.fillStyle = rank_textColor;

    if (rank_strokeSize > 0) {
        ctx.strokeStyle = rank_strokeColor;
        ctx.lineWidth = rank_strokeSize;
        ctx.strokeText(lbPositionText, rank_positionX, rank_positionY);
    }

    ctx.fillText(lbPositionText, rank_positionX, rank_positionY);
}

async function drawCardXP(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { cl_level, xp_middleLevel, level_textSize, level_textBaseline, level_textAlign, level_positionX, level_positionY } = decodedCode;
    const { xp_textSize, xp_textColor, xp_textBaseline, xp_textAlign, xp_strokeSize, xp_strokeColor } = decodedCode;
    let { xp_positionX, xp_positionY } = decodedCode;

    const { userLevel } = data;

    if (xp_middleLevel === "true" && cl_level !== undefined) {
        const fontSize = 50 * level_textSize;

        const levelsText = Localisation.getTranslation("magiclevels.level", userLevel.level);

        ctx.textBaseline = level_textBaseline;
        ctx.font = `${fontSize}px ${CANVAS_FONT}`;
        ctx.textAlign = level_textAlign;

        const metrics = ctx.measureText(levelsText);
        const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        xp_positionX = parseInt(level_positionX) + (metrics.width / 2.);
        xp_positionY = parseInt(level_positionY) + (actualHeight * 1.4);
    }

    const xpFontSize = 33.33333333333333 * xp_textSize;

    ctx.font = `${xpFontSize}px ${CANVAS_FONT}`;
    ctx.fillStyle = xp_textColor;
    ctx.textBaseline = xp_textBaseline;
    ctx.textAlign = xp_textAlign;
    if (xp_strokeSize > 0) {
        ctx.strokeStyle = xp_strokeColor;
        ctx.lineWidth = xp_strokeSize;
        ctx.strokeText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), xp_positionX, xp_positionY);
    }
    ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), xp_positionX, xp_positionY);
}

async function drawCardLevel(ctx: NodeCanvasRenderingContext2D, decodedCode, data) {
    const { level_textSize, level_textBaseline, level_textColor, level_textAlign, level_strokeSize, level_strokeColor, level_positionX, level_positionY } = decodedCode;

    const { userLevel } = data;

    const fontSize = 50 * level_textSize;

    const levelsText = Localisation.getTranslation("magiclevels.level", userLevel.level);

    ctx.textBaseline = level_textBaseline;
    ctx.fillStyle = level_textColor;
    ctx.font = `${fontSize}px ${CANVAS_FONT}`;
    ctx.textAlign = level_textAlign;
    if (level_strokeSize > 0) {
        ctx.strokeStyle = level_strokeColor;
        ctx.lineWidth = level_strokeSize;
        ctx.strokeText(levelsText, level_positionX, level_positionY);
    }
    ctx.fillText(levelsText, level_positionX, level_positionY);
}

// export async function _drawCardBackground(ctx: NodeCanvasRenderingContext2D, serverUserSettings: ServerUserSettings) {
//     // const { background_primaryColor, background_secondaryColor } = decodeCode("");
//     // let { background_cardTemplate, background_round } = decodeCode("");

//     let background_primaryColor = `#${serverUserSettings.cardColor}`;
//     let background_secondaryColor = `#${serverUserSettings.cardColorB}`;
//     let background_round = 3;
//     let background_cardTemplate = serverUserSettings.cardTemplate;

//     background_round /= 100;

//     if (background_cardTemplate === undefined)
//         background_cardTemplate = CardTemplate.Normal;

//     let cardTemplateImage: Image;

//     const cardTemplatePath = `${CARD_TEMPLATES_FOLDER}/${background_cardTemplate}.png`;

//     if (existsSync(cardTemplatePath)) {
//         cardTemplateImage = await loadImage(cardTemplatePath);
//     }

//     //Draw background

//     if (cardTemplateImage) {
//         const tempCanvas = createCanvas(cardCanvasWidth, cardCanvasHeight);
//         const tempCtx = tempCanvas.getContext("2d");

//         tempCtx.fillStyle = `${background_primaryColor}`;
//         roundRect(tempCtx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);

//         ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-in"), 0, 0);

//         tempCtx.clearRect(0, 0, cardCanvasWidth, cardCanvasHeight);

//         if (serverUserSettings.cardColorB === undefined) {
//             serverUserSettings.cardColorB = new ServerUserSettings("").cardColorB;
//         }

//         tempCtx.fillStyle = `${background_secondaryColor}`;
//         roundRect(tempCtx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);

//         ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-out"), 0, 0);
//     } else {
//         ctx.fillStyle = `${background_primaryColor}`;
//         roundRect(ctx, 0, 0, cardCanvasWidth, cardCanvasHeight, cardCanvasWidth * background_round);
//     }
// }

// export async function _drawCardWings(ctx: NodeCanvasRenderingContext2D, wingsImageA: string | Buffer | Image, wingsImageB: string | Buffer | Image, serverUserSettings: ServerUserSettings) {
//     if (serverUserSettings.wingsTemplate === undefined)
//         serverUserSettings.wingsTemplate = CardTemplate.Normal;

//     const wingsImages: Image[] = [];
//     let wingsTemplateImage: Image;

//     const wingsTemplatePath = `${CARD_TEMPLATES_FOLDER}/${serverUserSettings.wingsTemplate}.png`;

//     if (existsSync(wingsTemplatePath)) {
//         wingsTemplateImage = await loadImage(wingsTemplatePath);
//     }

//     //Draw Wings
//     if (typeof (wingsImageA) === "string" || Buffer.isBuffer(wingsImageA)) {
//         wingsImages.push(await loadImage(wingsImageA));
//     } else {
//         wingsImages.push(wingsImageA);
//     }

//     if (typeof (wingsImageB) === "string" || Buffer.isBuffer(wingsImageB)) {
//         wingsImages.push(await loadImage(wingsImageB));
//     } else {
//         wingsImages.push(wingsImageB);
//     }

//     if (wingsImages.length >= 2) {
//         if (wingsImages[0]) {
//             const wings = wingsImages[0];
//             const wingsX = (cardCanvasWidth - wings.width) / 2.;
//             const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

//             if (!wingsTemplateImage) {
//                 ctx.drawImage(wings, wingsX, wingsY);
//             }
//             else {
//                 ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-in"), wingsX, wingsY);
//             }
//         }

//         if (wingsImages[1]) {
//             const wings = wingsImages[1];
//             const wingsX = (cardCanvasWidth - wings.width) / 2.;
//             const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

//             if (!wingsTemplateImage) {
//                 ctx.drawImage(wings, wingsX, wingsY);
//             }
//             else {
//                 ctx.drawImage(drawMaskedImage(wingsTemplateImage, wings, "source-out"), wingsX, wingsY);
//             }
//         }
//     } else if (wingsImages.length) {
//         const wings = wingsImages[0];
//         const wingsX = (cardCanvasWidth - wings.width) / 2.;
//         const wingsY = ((cardNewPfpRadius + cardPfpY + cardBorderThickness) - wings.height / 2.);

//         ctx.drawImage(wings, wingsX, wingsY);
//     }
// }

// export async function _drawCardName(ctx: NodeCanvasRenderingContext2D, member: GuildMember, serverUserSettings: ServerUserSettings) {
//     const CustomNames = BotUser.getDatabase(DatabaseType.CustomNames);
//     const user = member.user;

//     if (serverUserSettings.cardName === undefined) {
//         serverUserSettings.cardName = "NICKNAME";
//     }

//     if (serverUserSettings.cardName !== "DISABLED") {

//         const getCustomName = async () => {
//             const customNames: string[] = await CustomNames.keys();
//             const customNameUsers: CustomNameUser[][] = await CustomNames.values();
//             let toReturn = serverUserSettings.cardName === "NICKNAME" ? (member.nickname || user.username) : user.username;

//             await asyncForEach(customNameUsers, async (users, i) => {
//                 return await asyncForEach(users, u => {
//                     if (u.id === user.id) {
//                         toReturn = customNames[i];
//                         return true;
//                     }
//                 });
//             });

//             return toReturn;
//         };

//         const userName = await getCustomName();

//         //Draw name
//         ctx.font = `${cardNameFontSize}px ${CANVAS_FONT}`;
//         if (serverUserSettings.nameColor === new ServerUserSettings(user.id).nameColor || !isHexColor(serverUserSettings.nameColor)) {
//             if (member.roles && member.roles.color && member.roles.color.color) ctx.fillStyle = member.roles.color.hexColor;
//         } else {
//             ctx.fillStyle = `#${serverUserSettings.nameColor}`;
//         }
//         ctx.textBaseline = "top";
//         ctx.textAlign = "center";
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 3;
//         ctx.strokeText(userName, cardNamePosX, cardNamePosY);
//         ctx.fillText(userName, cardNamePosX, cardNamePosY);
//     }
// }

// export async function drawCardInfoText(ctx: NodeCanvasRenderingContext2D, guild: Guild, userLevel: UserLevel, serverUserSettings: ServerUserSettings, currentRank: RankLevel, nextRank: RankLevel, leaderboardPosition: number) {
//     let currentRankText = Localisation.getTranslation("generic.none");
//     if (currentRank) {
//         const role = await getRoleById(currentRank.roleId, guild);
//         currentRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
//     }
//     currentRankText = Localisation.getTranslation("magiclevels.transformation.current", currentRankText);
//     if (currentRank)
//         currentRankText += ` ${Localisation.getTranslation("magiclevels.transformation.current.level", currentRank.level)}`;

//     let nextRankText = Localisation.getTranslation("generic.none");
//     if (nextRank) {
//         const role = await getRoleById(nextRank.roleId, guild);
//         nextRankText = role ? capitalise(role.name) : Localisation.getTranslation("generic.unknown");
//     }
//     nextRankText = Localisation.getTranslation("magiclevels.transformation.next", nextRankText);
//     if (nextRank)
//         nextRankText += ` ${Localisation.getTranslation("magiclevels.transformation.next.level", nextRank.level)}`;

//     const levelsText = Localisation.getTranslation("magiclevels.level", userLevel.level);
//     const lbPositionText = Localisation.getTranslation("magiclevels.lb.position", leaderboardPosition);

//     const textColor = getBrightnessColor(hexToRGB(serverUserSettings.cardColor));

//     const currentRankFontSize = fitTextOnCanvas(ctx, currentRankText, cardCanvasWidth);
//     const nextRankFontSize = fitTextOnCanvas(ctx, nextRankText, cardCanvasWidth);
//     const extraInfoFontSize = currentRankFontSize < nextRankFontSize ? currentRankFontSize : nextRankFontSize;

//     //Draw Levels
//     ctx.textBaseline = "top";
//     ctx.fillStyle = textColor;
//     ctx.font = `${cardTopInfoFontSize}px ${CANVAS_FONT}`;
//     ctx.textAlign = "left";
//     ctx.fillText(levelsText, cardLevelPosX, cardNamePosY);
//     const metrics = ctx.measureText(levelsText);
//     const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

//     ctx.font = cardLevelFont;
//     ctx.fillStyle = textColor;
//     ctx.textBaseline = "top";
//     ctx.textAlign = "center";
//     ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), cardLevelPosX + (metrics.width / 2.), cardNamePosY + (actualHeight * 1.4));

//     //Draw Leaderboard Position
//     ctx.textBaseline = "top";
//     ctx.fillStyle = textColor;
//     ctx.font = `${cardTopInfoFontSize}px ${CANVAS_FONT}`;
//     ctx.textAlign = "right";
//     ctx.fillText(lbPositionText, cardRankPosX, cardNamePosY);

//     ctx.font = `${extraInfoFontSize}px ${CANVAS_FONT}`;
//     ctx.textBaseline = 'bottom';
//     ctx.textAlign = "center";
//     ctx.fillStyle = textColor;
//     ctx.fillText(currentRankText, cardCanvasWidth / 2, cardExtraTextStartPosY + cardExtraTextPosY);

//     ctx.fillText(nextRankText, cardCanvasWidth / 2, cardExtraTextStartPosY + (cardExtraTextPosY * 2));
// }

// export async function drawCardXPCircle(ctx: NodeCanvasRenderingContext2D, serverUserSettings: ServerUserSettings, userLevel: UserLevel) {
//     const filled = userLevel.xp / getLevelXP(userLevel.level);

//     const startRGB = hexToRGB(serverUserSettings.barStartColor);
//     const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

//     const endRGB = hexToRGB(serverUserSettings.barEndColor);
//     const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

//     if (serverUserSettings.specialCircleColor && serverUserSettings.specialCircleColor !== new ServerUserSettings("").specialCircleColor) {
//         ctx.save();
//         ctx.beginPath();
//         ctx.arc(cardNewPfpRadius + cardPfpX + cardBorderThickness, cardNewPfpRadius + cardPfpY + cardBorderThickness, cardPfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360));
//         ctx.strokeStyle = `#${serverUserSettings.specialCircleColor}`;
//         ctx.lineWidth = cardBorderThickness * 2;
//         ctx.stroke();
//         ctx.restore();
//     }

//     ctx.save();
//     ctx.beginPath();
//     ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
//     ctx.lineWidth = cardBorderThickness * 2;
//     ctx.arc(cardNewPfpRadius + cardPfpX + cardBorderThickness, cardNewPfpRadius + cardPfpY + cardBorderThickness, cardPfpRadius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
//     ctx.stroke();
//     ctx.restore();
// }

// export async function _drawCardPfp(ctx: NodeCanvasRenderingContext2D, userAvatar: Image | Canvas) {
//     //Draw Profile Picture
//     ctx.save();
//     ctx.beginPath();
//     ctx.arc(cardNewPfpRadius + cardPfpX + cardBorderThickness, cardNewPfpRadius + cardPfpY + cardBorderThickness, cardNewPfpRadius, 0, Math.PI * 2, true);
//     ctx.closePath();
//     ctx.clip();

//     ctx.drawImage(userAvatar, cardPfpX + cardBorderThickness, cardPfpY + cardBorderThickness, cardNewPfpRadius * 2, cardNewPfpRadius * 2);
//     ctx.restore();
// }

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
