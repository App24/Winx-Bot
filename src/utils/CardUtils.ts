import { Canvas, createCanvas, Image, loadImage, CanvasRenderingContext2D, CanvasTextAlign, CanvasTextBaseline } from "canvas";
import { GuildMember, User } from "discord.js";
import { existsSync } from "fs";
import { CANVAS_FONT, CARD_CANVAS_HEIGHT, CARD_CANVAS_WIDTH, CARD_TEMPLATES_FOLDER, LB_USERS } from "../Constants";
import { Localisation } from "../localisation";
import { CustomWings } from "../structs/databaseTypes/CustomWings";
import { RankLevel, RankLevelData } from "../structs/databaseTypes/RankLevel";
import { CardTemplate, DEFAULT_CARD_CODE, ServerUserSettings, ServerUserSettingsData } from "../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { rgbToHsl, fitTextOnCanvas, roundRect, underlineText, canvasColor } from "./CanvasUtils";
import { capitalise } from "./FormatUtils";
import { getRoleById } from "./GetterUtils";
import { getWingsImageByLevel } from "./RankUtils";
import { asyncForEach, hexToRGB, blend, isHexColor, getBrightnessColor, isBooster, isPatron, getOneDatabase, getDatabase } from "./Utils";
import { getLevelXP } from "./XPUtils";
import { LevelData } from "../structs/databaseTypes/LevelData";
import { DocumentWrapper, ModelWrapper } from "../structs/ModelWrapper";

export interface CardData {
    leaderboardPosition: number,
    weeklyLeaderboardPosition: number,
    userLevel: LevelData,
    serverUserSettings: ModelWrapper<typeof ServerUserSettings.schema>,
    wingsImage?: CanvasImage,
    currentRank: ModelWrapper<typeof RankLevel.schema>,
    nextRank: ModelWrapper<typeof RankLevel.schema>,
    member: GuildMember,
    customWings?: CanvasImage
}

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

export async function drawCard(cardData: CardData) {
    const serverUserSettings = cardData.serverUserSettings;
    const member = cardData.member;
    const guild = cardData.member.guild;
    const userLevel = cardData.userLevel;

    // if (serverUserSettings.cardWings === undefined)
    //     serverUserSettings.cardWings = "ENABLED";

    const { cl_customWings } = decodeCode(serverUserSettings.document.cardCode);

    const wings = await getOneDatabase(CustomWings, { guildId: guild.id, userId: member.id });
    let wingsImage: Image;
    if (cl_customWings && !wings.isNull() && existsSync(wings.document.wingsFile) && ((await isPatron(member.id, guild.id)) || isBooster(member))) {
        wingsImage = await loadImage(wings.document.wingsFile);
    }

    const wingsImageA = await getWingsImageByLevel(serverUserSettings.document.wingsLevel < 0 ? userLevel.level : serverUserSettings.document.wingsLevel, serverUserSettings.document.winxCharacter, guild.id);

    cardData.wingsImage = wingsImageA;
    cardData.customWings = wingsImage;

    return drawCardWithWings(cardData);
}

type CanvasImage = string | Buffer | Image;

export async function drawCardWithWings(cardData: CardData) {
    const member = cardData.member;

    const avatar = await loadImage(member.displayAvatarURL({ extension: 'png', size: 512 }));
    return { image: (await drawCardFrame(avatar, cardData)).toBuffer(), extension: "png" };
}

export async function drawGreenScreenCard(greenScreenColor: string, cardData: CardData) {
    const { member, serverUserSettings, userLevel } = cardData;
    const guild = member.guild;

    // if (serverUserSettings.cardWings === undefined)
    //     serverUserSettings.cardWings = "ENABLED";

    const { cl_customWings } = decodeCode(serverUserSettings.document.cardCode);

    const wings = await getOneDatabase(CustomWings, { guildId: guild.id, userId: member.id });
    let wingsImage: Image;
    if (cl_customWings && !wings.isNull() && existsSync(wings.document.wingsFile) && ((await isPatron(member.id, guild.id)) || isBooster(member))) {
        wingsImage = await loadImage(wings.document.wingsFile);
    }

    const wingsImageA = await getWingsImageByLevel(serverUserSettings.document.wingsLevel < 0 ? userLevel.level : serverUserSettings.document.wingsLevel, serverUserSettings.document.winxCharacter, guild.id);

    const avatar = canvasColor(greenScreenColor, 64, 64);

    cardData.customWings = wingsImage;
    cardData.wingsImage = wingsImageA;

    return (await drawCardFrame(avatar, cardData)).toBuffer();
}

async function drawCardFrame(userAvatar: Image | Canvas, cardData: CardData) {
    const { member, serverUserSettings, weeklyLeaderboardPosition, leaderboardPosition, currentRank, nextRank, userLevel, customWings, wingsImage: wingsImageA } = cardData;
    const guild = member.guild;

    const canvas = createCanvas(CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT);
    const ctx = canvas.getContext("2d");

    const decodedCode = decodeCode(serverUserSettings.document.cardCode);

    const { cl_roleIcon, cl_background, cl_wings, cl_customWings, cl_pfp, cl_xpBar, cl_pfpCircle, cl_nextTransformation, cl_currentTransformation, cl_rank, cl_xp, cl_levels, cl_name, cl_weekrank } = decodedCode;

    const varToString = (varObj) => Object.keys(varObj)[0];

    const layers: { varName: string, layer: number }[] = [
        { varName: varToString({ cl_background }), layer: cl_background },
        { varName: varToString({ cl_wings }), layer: cl_wings },
        { varName: varToString({ cl_customWings }), layer: cl_customWings },
        { varName: varToString({ cl_pfp }), layer: cl_pfp },
        { varName: varToString({ cl_xpBar }), layer: cl_xpBar },
        { varName: varToString({ cl_pfpCircle }), layer: cl_pfpCircle },
        { varName: varToString({ cl_nextTransformation }), layer: cl_nextTransformation },
        { varName: varToString({ cl_currentTransformation }), layer: cl_currentTransformation },
        { varName: varToString({ cl_rank }), layer: cl_rank },
        { varName: varToString({ cl_weekrank }), layer: cl_weekrank },
        { varName: varToString({ cl_xp }), layer: cl_xp },
        { varName: varToString({ cl_levels }), layer: cl_levels },
        { varName: varToString({ cl_name }), layer: cl_name },
        { varName: varToString({ cl_roleIcon }), layer: cl_roleIcon }
    ];

    layers.sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));

    const drawFuncs = {
        "cl_background": drawCardBackground,
        "cl_customWings": drawCardCustomWings,
        "cl_wings": drawCardWings,
        "cl_pfp": drawCardPfp,
        "cl_xpBar": drawCardXPBar,
        "cl_pfpCircle": drawCardPfpCircle,
        "cl_nextTransformation": drawCardNextTransformation,
        "cl_currentTransformation": drawCardCurrentTransformation,
        "cl_rank": drawCardRank,
        "cl_weekrank": drawCardWeeklyRank,
        "cl_xp": drawCardXP,
        "cl_levels": drawCardLevel,
        "cl_name": drawCardName,
        "cl_roleIcon": drawCardRoleIcon
    };

    const data = { customWings, wingsImageA, member, guild, userLevel, currentRank: currentRank.document, nextRank: nextRank.document, leaderboardPosition, userAvatar, weeklyLeaderboardPosition };

    await asyncForEach(layers, async (layer) => {
        if (layer.layer === undefined) return;
        const func = drawFuncs[layer.varName];
        if (func && typeof func === "function") {
            // if (layer.varName === "cl_customWings" && member.id === "598199612289056769") return;
            await func(ctx, decodedCode, data);
        }
    });

    return canvas;
}

export async function drawTemplateCard(member: GuildMember) {
    const serverUserSettings = new ServerUserSettings({ guildId: member.guild.id, userId: member.id });
    // serverUserSettings.specialCircleColor = "ffffff";

    const userLevel = new UserLevel({ guildId: member.guild.id, levelData: { userd: member.id } });

    serverUserSettings.cardCode = "pfpCircle_width=10|pfpCircle_color=#ffffff|pfp_positionX=600|pfp_positionY=260|pfp_size=1|cl_pfpCircle=4|cl_pfp=5";

    const cardData: CardData = {
        leaderboardPosition: 0,
        weeklyLeaderboardPosition: 0,
        currentRank: new ModelWrapper(null),
        nextRank: new ModelWrapper(null),
        member,
        serverUserSettings: new ModelWrapper(serverUserSettings),
        userLevel: userLevel.levelData
    };

    return drawCardFrame(await loadImage(member.displayAvatarURL({ extension: "png" })), cardData);
}

async function drawCardBackground(ctx: CanvasRenderingContext2D, decodedCode) {
    const { background_primaryColor, background_secondaryColor } = decodedCode;
    let { background_template, background_round } = decodedCode;

    background_round /= 100;

    if (background_template === undefined)
        background_template = CardTemplate.Normal;

    let cardTemplateImage: Image;

    const cardTemplatePath = `${CARD_TEMPLATES_FOLDER}/${background_template}.png`;

    if (existsSync(cardTemplatePath)) {
        cardTemplateImage = await loadImage(cardTemplatePath);
    }

    //Draw background

    if (cardTemplateImage) {
        const tempCanvas = createCanvas(CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT);
        const tempCtx = tempCanvas.getContext("2d");

        tempCtx.fillStyle = `${background_primaryColor}`;
        roundRect(tempCtx, 0, 0, CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT, CARD_CANVAS_WIDTH * background_round);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-in"), 0, 0);

        tempCtx.clearRect(0, 0, CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT);

        tempCtx.fillStyle = `${background_secondaryColor}`;
        roundRect(tempCtx, 0, 0, CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT, CARD_CANVAS_WIDTH * background_round);

        ctx.drawImage(drawMaskedImage(cardTemplateImage, tempCanvas, "source-out"), 0, 0);
    } else {
        ctx.fillStyle = `${background_primaryColor}`;
        roundRect(ctx, 0, 0, CARD_CANVAS_WIDTH, CARD_CANVAS_HEIGHT, CARD_CANVAS_WIDTH * background_round);
    }
}

async function drawCardCustomWings(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { customWings_positionX, customWings_positionY, customWings_scaleX: scaleX, customWings_scaleY: scaleY } = decodedCode;

    const { customWings } = data;

    // const CustomWingsDatabase = BotUser.getDatabase(DatabaseType.CustomWings);
    // const customWings: CustomWings[] = await getServerDatabase(CustomWingsDatabase, guild.id);

    // const wings = customWings.find(w => w.userId === member.id);

    // // if (!wings || !existsSync(wings.wingsFile)) return;

    // // if (!(await isPatreon(member.id, guild.id)) && !isBooster(member)) return;

    // if (!(wings && existsSync(wings.wingsFile) && ((await isPatreon(member.id, guild.id)) || isBooster(member)))) {
    //     return;
    // }

    let wingsImage = customWings;
    if (typeof (customWings) === "string" || Buffer.isBuffer(customWings))
        wingsImage = await loadImage(customWings);

    if (wingsImage) {
        const wingsWidth = (wingsImage.width * scaleX);
        const wingsHeight = (wingsImage.height * scaleY);

        const wingsX = customWings_positionX - wingsWidth / 2.;
        const wingsY = customWings_positionY - wingsHeight / 2.;

        ctx.drawImage(wingsImage, wingsX, wingsY, wingsWidth, wingsHeight);
    }
}

async function drawCardWings(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { wings_followPfp, pfp_positionX, pfp_positionY, pfp_size } = decodedCode;
    const { wings_wingsAScaleX, wings_wingsAScaleY } = decodedCode;
    let { wings_positionX, wings_positionY, wings_autoSizeWingsA } = decodedCode;

    if (wings_followPfp === "true") {
        if (pfp_positionX !== undefined)
            wings_positionX = pfp_positionX;
        if (pfp_positionY !== undefined)
            wings_positionY = pfp_positionY;
    }

    wings_autoSizeWingsA = (wings_autoSizeWingsA ?? "true") == "true";

    const { wingsImageA } = data;

    if (!wingsImageA) return;

    let wingsImage: Image = null;

    //Draw Wings
    if (typeof (wingsImageA) === "string" || Buffer.isBuffer(wingsImageA)) {
        wingsImage = await loadImage(wingsImageA);
    } else {
        wingsImage = wingsImageA;
    }

    const drawWings = (wingsImage: Image, autoScale: boolean, scaleX: number, scaleY: number) => {
        const wingsWidth = (wingsImage.width * (autoScale ? pfp_size : scaleX));
        const wingsHeight = (wingsImage.height * (autoScale ? pfp_size : scaleY));

        const wingsX = wings_positionX - wingsWidth / 2.;
        const wingsY = wings_positionY - wingsHeight / 2.;

        ctx.drawImage(wingsImage, wingsX, wingsY, wingsWidth, wingsHeight);
    };

    drawWings(wingsImage, wings_autoSizeWingsA, wings_wingsAScaleX, wings_wingsAScaleY);
}

async function drawCardPfp(ctx: CanvasRenderingContext2D, decodedCode, data) {
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

async function drawCardXPBar(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { xpBar_startColor, xpBar_endColor, pfp_size, pfp_positionX, pfp_positionY, xpBar_type, xpBar_size, xpBar_height, xpBar_barAlign, xpBar_barColor } = decodedCode;
    let { xpBar_width, xpBar_positionX, xpBar_positionY, xpBar_round } = decodedCode;

    const { userLevel } = data;

    xpBar_positionX = parseInt(xpBar_positionX);
    xpBar_positionY = parseInt(xpBar_positionY);

    xpBar_width = parseInt(xpBar_width);

    const filled = userLevel.xp / getLevelXP(userLevel.level);

    const startRGB = hexToRGB(xpBar_startColor);
    const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

    const endRGB = hexToRGB(xpBar_endColor);
    const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);
    switch (xpBar_type) {
        default:
        case "circle": {
            const pfpRadius = 130 * pfp_size;
            const cardPfpX = pfp_positionX - pfpRadius;
            const cardPfpY = pfp_positionY - pfpRadius;

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
            ctx.lineWidth = xpBar_width * 2;
            ctx.arc(pfpRadius + cardPfpX, pfpRadius + cardPfpY, pfpRadius + xpBar_width, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
            ctx.stroke();
            ctx.restore();
        } break;
        case "bar": {
            xpBar_round /= 10;

            const barWidth = 600 * xpBar_size;
            const barHeight = 30 * xpBar_height;

            xpBar_positionX = xpBar_positionX - barWidth / 2;
            xpBar_positionY = xpBar_positionY - barHeight / 2;

            let filledBarX = xpBar_positionX;
            const filledBarY = xpBar_positionY;

            switch (xpBar_barAlign) {
                case "center": {
                    filledBarX += (barWidth / 2) - (barWidth * filled) / 2;
                } break;
                case "right": {
                    filledBarX += (barWidth) - (barWidth * filled);
                } break;
            }

            ctx.fillStyle = xpBar_barColor;
            ctx.save();
            roundRect(ctx, xpBar_positionX, xpBar_positionY, barWidth, barHeight, barHeight * xpBar_round);
            ctx.restore();

            ctx.fillStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
            ctx.save();
            roundRect(ctx, filledBarX, filledBarY, barWidth * filled, barHeight, barHeight * xpBar_round, "clip");
            ctx.fillRect(filledBarX, filledBarY, barWidth * filled, barHeight);
            ctx.restore();
        } break;
    }
}

async function drawCardPfpCircle(ctx: CanvasRenderingContext2D, decodedCode) {
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

async function drawCardName(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { name_type, name_matchRole, name_textColor, name_textAlign, name_textBaseline, name_textSize, name_positionX, name_positionY, name_strokeColor, name_strokeSize } = decodedCode;
    let { name_textFont } = decodedCode;
    name_textFont = name_textFont ?? CANVAS_FONT;

    const { member } = data;

    const user = member.user;

    const userName = name_type === "nickname" ? (member.nickname || user.username) : user.username;

    const cardNameFontSize = 60 * name_textSize;

    //Draw name
    ctx.font = `${cardNameFontSize}px ${name_textFont}`;

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

async function drawCardNextTransformation(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { nextTransformation_positionX, nextTransformation_positionY, nextTransformation_textColor, nextTransformation_strokeColor, nextTransformation_strokeSize, nextTransformation_textAlign, nextTransformation_textBaseline } = decodedCode;
    let { nextTransformation_textFont } = decodedCode;
    nextTransformation_textFont = nextTransformation_textFont ?? CANVAS_FONT;

    const { nextRank, guild } = data;

    let nextRankText = Localisation.getLocalisation("generic.none");
    if (nextRank) {
        const role = await getRoleById(nextRank.roleId, guild);
        nextRankText = role ? capitalise(role.name) : Localisation.getLocalisation("generic.unknown");
    }
    nextRankText = Localisation.getLocalisation("magiclevels.transformation.next", nextRankText);
    if (nextRank)
        nextRankText += ` ${Localisation.getLocalisation("magiclevels.transformation.next.level", nextRank.level)}`;

    const fontSize = fitTextOnCanvas(ctx, nextRankText, CARD_CANVAS_WIDTH, nextTransformation_textFont);

    ctx.font = `${fontSize}px ${nextTransformation_textFont}`;
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

async function drawCardCurrentTransformation(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { currentTransformation_positionX, currentTransformation_positionY, currentTransformation_textColor, currentTransformation_strokeColor, currentTransformation_strokeSize, currentTransformation_textAlign, currentTransformation_textBaseline } = decodedCode;
    let { currentTransformation_textFont } = decodedCode;
    currentTransformation_textFont = currentTransformation_textFont ?? CANVAS_FONT;

    const { currentRank, guild } = data;

    let currentRankText = Localisation.getLocalisation("generic.none");
    if (currentRank) {
        const role = await getRoleById(currentRank.roleId, guild);
        currentRankText = role ? capitalise(role.name) : Localisation.getLocalisation("generic.unknown");
    }
    currentRankText = Localisation.getLocalisation("magiclevels.transformation.current", currentRankText);
    if (currentRank)
        currentRankText += ` ${Localisation.getLocalisation("magiclevels.transformation.current.level", currentRank.level)}`;

    const fontSize = fitTextOnCanvas(ctx, currentRankText, CARD_CANVAS_WIDTH, currentTransformation_textFont);

    ctx.font = `${fontSize}px ${currentTransformation_textFont}`;
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

async function drawCardRank(ctx: CanvasRenderingContext2D, decodedCode, data) {

    const { rank_textFont, rank_positionX, rank_positionY, rank_strokeColor, rank_strokeSize, rank_textAlign, rank_textBaseline, rank_textColor, rank_textSize } = decodedCode;

    const { leaderboardPosition } = data;

    const lbPositionText = Localisation.getLocalisation("magiclevels.lb.position", leaderboardPosition);

    const cardTopInfoFontSize = 50 * rank_textSize;

    drawCardText(ctx, lbPositionText, cardTopInfoFontSize, rank_textFont, rank_textColor, rank_textBaseline, rank_textAlign, rank_strokeSize, rank_strokeColor, rank_positionX, rank_positionY);
}

async function drawCardWeeklyRank(ctx: CanvasRenderingContext2D, decodedCode, data) {

    const { weekrank_textFont, weekrank_positionX, weekrank_positionY, weekrank_strokeColor, weekrank_strokeSize, weekrank_textAlign, weekrank_textBaseline, weekrank_textColor, weekrank_textSize } = decodedCode;

    const { weeklyLeaderboardPosition } = data;

    const lbPositionText = Localisation.getLocalisation("magiclevels.weeklb.position", weeklyLeaderboardPosition);

    const cardTopInfoFontSize = 50 * weekrank_textSize;

    drawCardText(ctx, lbPositionText, cardTopInfoFontSize, weekrank_textFont, weekrank_textColor, weekrank_textBaseline, weekrank_textAlign, weekrank_strokeSize, weekrank_strokeColor, weekrank_positionX, weekrank_positionY);
}

async function drawCardXP(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { cl_levels, xp_middleLevel, levels_textSize, levels_textBaseline, levels_textAlign, levels_positionX, levels_positionY } = decodedCode;
    const { xp_textSize, xp_textFont, xp_textColor, xp_textBaseline, xp_textAlign, xp_strokeSize, xp_strokeColor } = decodedCode;
    let { xp_positionX, xp_positionY } = decodedCode;
    const { xp_autoOffset } = decodedCode;
    const { xp_offsetY } = decodedCode;
    let { levels_textFont } = decodedCode;
    levels_textFont = levels_textFont ?? CANVAS_FONT;

    const { userLevel } = data;

    if (xp_middleLevel === "true" && cl_levels !== undefined) {
        const fontSize = 50 * levels_textSize;

        const levelsText = Localisation.getLocalisation("magiclevels.level", userLevel.level);

        ctx.textBaseline = levels_textBaseline;
        ctx.font = `${fontSize}px ${levels_textFont}`;
        ctx.textAlign = levels_textAlign;

        const metrics = ctx.measureText(levelsText);
        const actualHeight = metrics.actualBoundingBoxDescent;

        xp_positionX = parseInt(levels_positionX) + ((metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft) / 2.);
        xp_positionY = parseInt(levels_positionY);
        if (xp_autoOffset === "false") {
            xp_positionY += xp_offsetY;
        } else {
            xp_positionY += (actualHeight * 1.4);
        }
    }

    const fontSize = 33.33333333333333 * xp_textSize;

    drawCardText(ctx, Localisation.getLocalisation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), fontSize, xp_textFont, xp_textColor, xp_textBaseline, xp_textAlign, xp_strokeSize, xp_strokeColor, xp_positionX, xp_positionY);
}

async function drawCardLevel(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { levels_textFont, levels_textSize, levels_textBaseline, levels_textColor, levels_textAlign, levels_strokeSize, levels_strokeColor, levels_positionX, levels_positionY } = decodedCode;

    const { userLevel } = data;

    const fontSize = 50 * levels_textSize;

    const levelsText = Localisation.getLocalisation("magiclevels.level", userLevel.level);

    drawCardText(ctx, levelsText, fontSize, levels_textFont, levels_textColor, levels_textBaseline, levels_textAlign, levels_strokeSize, levels_strokeColor, levels_positionX, levels_positionY);
}

async function drawCardRoleIcon(ctx: CanvasRenderingContext2D, decodedCode, data) {
    const { roleIcon_positionX, roleIcon_positionY, roleIcon_scaleX, roleIcon_scaleY } = decodedCode;
    let { roleIcon_autoSize } = decodedCode;
    roleIcon_autoSize = roleIcon_autoSize == "true";

    const { member } = data;

    if (member.roles && member.roles.icon && member.roles.icon.icon) {
        const icon = await loadImage(member.roles.icon.iconURL({ format: "png" }));
        if (icon) {
            const iconWidth = icon.width * (roleIcon_autoSize ? 1 : roleIcon_scaleX);
            const iconHeight = icon.height * (roleIcon_autoSize ? 1 : roleIcon_scaleY);
            ctx.drawImage(icon, roleIcon_positionX, roleIcon_positionY, iconWidth, iconHeight);
        }
    }
}

function drawCardText(ctx: CanvasRenderingContext2D, text: string, fontSize: number, font: string, textColor: string, textBaseline: CanvasTextBaseline, textAlign: CanvasTextAlign, strokeSize: number, strokeColor: string, positionX: number, positionY: number) {

    font = font ?? CANVAS_FONT;

    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = textBaseline;
    ctx.textAlign = textAlign;
    if (strokeSize > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeSize;
        ctx.strokeText(text, positionX, positionY);
    }
    ctx.fillText(text, positionX, positionY);
}

export async function drawLeaderboard(leaderboardLevels: { userLevel: LevelData, member: GuildMember, position: number }[], user: User, guildId: string, title: string) {
    const serverUserSettings = await getDatabase(ServerUserSettings, { guildId });

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
        const levelText = Localisation.getLocalisation("leaderboard.output", value.userLevel.level);
        textSizes.push(ctx.measureText(`${value.position + 1}. ${value.member.user.tag} ${levelText}`).width + ((pfpRadius + pfpPadding) + (pfpRadius + borderThickness + pfpPadding * 2)));
    });

    let width = textSizes[0];
    textSizes.forEach(size => {
        if (size > width) width = size;
    });
    width = Math.max(width, 1200);

    const leaderboardLength = leaderboardLevels.length + 1;

    canvas.width = width;
    canvas.height = ((pfpPadding) * (leaderboardLength + 1)) + (pfpRadius + pfpPadding) * (leaderboardLength * 2);

    const colors: string[] = [];

    const getBackgroundColor = (background_primaryColor: string, background_secondaryColor: string, lb_backgroundColorType: string, lb_primaryColor: string) => {
        const { background_primaryColor: default_background_primaryColor, background_secondaryColor: default_background_secondaryColor, lb_backgroundColorType: default_lb_backgroundColorType } = decodeCode(DEFAULT_CARD_CODE);
        const backgroundColorType = lb_backgroundColorType ?? default_lb_backgroundColorType;
        switch (backgroundColorType) {
            case "custom":
            case "none":
                return lb_primaryColor;
            default:
            case "primaryColor":
                return background_primaryColor ?? default_background_primaryColor;
            case "secondaryColor":
                return background_secondaryColor ?? default_background_secondaryColor;
        }
    };

    colors.push(getBackgroundColor(null, null, null, null));

    await asyncForEach(leaderboardLevels, async (value) => {
        let userSettings = serverUserSettings.find(s => s.document.userId === value.member.id);
        if (!userSettings || userSettings.isNull()) {
            userSettings = new DocumentWrapper(new ServerUserSettings({ guildId, userId: value.member.id }));
            await userSettings.save();
        }
        const { background_primaryColor, background_secondaryColor, lb_primaryColor, lb_backgroundColorType } = decodeCode(userSettings.document.cardCode);
        const color = getBackgroundColor(background_primaryColor, background_secondaryColor, lb_backgroundColorType, lb_primaryColor);
        colors.push(color);
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
        ctx.fillStyle = `${color}`;
        ctx.fillRect(0, i <= 0 ? 0 : yPos, canvas.width, height);
        if (i >= 0 && i < colors.length - 1) {
            const grd = ctx.createLinearGradient(0, i <= 0 ? height : yPos + height, 0, (i <= 0 ? height : yPos + height) + 20);
            grd.addColorStop(0, `${color}`);
            grd.addColorStop(1, `${colors[i + 1]}`);
            ctx.fillStyle = grd;
            ctx.fillRect(0, i <= 0 ? height : yPos + height, canvas.width, 20);
        }
    });

    ctx.restore();

    {

        const textFontSize = fitTextOnCanvas(ctx, title, canvas.width - (pfpPadding * 2), CANVAS_FONT, 100);
        const textFont = `${textFontSize}px ${CANVAS_FONT}`;

        const textColor = getBrightnessColor(hexToRGB(colors[0]));

        const x = pfpPadding;
        const y = ((pfpPadding) * 1) + pfpRadius + (pfpRadius + pfpPadding) * 0;

        ctx.font = textFont;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        ctx.fillText(title, x, y);
    }

    let previousUserSettings: ModelWrapper<typeof ServerUserSettings.schema>;

    await asyncForEach(leaderboardLevels, async (value, i) => {
        let userSettings = serverUserSettings.find(s => s.document.userId === value.member.id);
        if (!userSettings || userSettings.isNull()) {
            userSettings = new DocumentWrapper(new ServerUserSettings({ guildId, userId: value.member.id }));
            await userSettings.save();
        }

        const { lb_nameType, background_primaryColor, background_secondaryColor, pfpCircle_color, lb_backgroundColorType, lb_primaryColor } = decodeCode(userSettings.document.cardCode);
        let { xpBar_startColor, xpBar_endColor } = decodeCode(userSettings.document.cardCode);
        const { xpBar_startColor: default_xpBar_startColor, xpBar_endColor: default_xpBar_endColor, lb_nameType: default_lb_nameType } = decodeCode(DEFAULT_CARD_CODE);

        const color = getBackgroundColor(background_primaryColor, background_secondaryColor, lb_backgroundColorType, lb_primaryColor);
        // background_primaryColor = lb_primaryColor ?? background_primaryColor ?? default_background_primaryColor;
        xpBar_startColor = xpBar_startColor ?? default_xpBar_startColor;
        xpBar_endColor = xpBar_endColor ?? default_xpBar_endColor;

        const pfpX = pfpRadius + pfpPadding;
        const pfpY = ((pfpPadding) * ((i + 1) + 1)) + pfpRadius + (pfpRadius + pfpPadding) * ((i + 1) * 2);

        const userLevel = value.userLevel;

        const levelText = Localisation.getLocalisation("leaderboard.output", value.userLevel.level);

        const filled = userLevel.xp / getLevelXP(userLevel.level);

        const startRGB = hexToRGB(xpBar_startColor);
        const startHsl = rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

        const endRGB = hexToRGB(xpBar_endColor);
        const endHsl = rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

        const textColor = getBrightnessColor(hexToRGB(color));

        if (value.position >= LB_USERS) {
            const { background_primaryColor, background_secondaryColor, lb_backgroundColorType, lb_primaryColor } = decodeCode(previousUserSettings.document.cardCode);
            ctx.fillStyle = getBrightnessColor(hexToRGB(getBackgroundColor(background_primaryColor, background_secondaryColor, lb_backgroundColorType, lb_primaryColor)));
            ctx.fillRect(0, pfpY - pfpRadius - pfpPadding - (separatorHeight / 2.), canvas.width, separatorHeight);
        }

        if (pfpCircle_color) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(pfpX + borderThickness, pfpY + borderThickness, pfpRadius + borderThickness, 0, 360);
            ctx.strokeStyle = pfpCircle_color;
            ctx.lineWidth = borderThickness * 2;
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${blend(startHsl.h, endHsl.h, 1 - filled) * 360}, ${blend(startHsl.s, endHsl.s, 1 - filled) * 100}%, ${blend(startHsl.l, endHsl.l, 1 - filled) * 100}%, 1)`;
        ctx.lineWidth = borderThickness * 2;
        ctx.arc(pfpX + borderThickness, pfpY + borderThickness, pfpRadius + borderThickness, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + (360 * filled)));
        ctx.stroke();
        ctx.restore();

        //Draw Profile Picture
        ctx.save();
        ctx.beginPath();
        ctx.arc(pfpX + borderThickness, pfpY + borderThickness, newPfpRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(value.member.displayAvatarURL({ extension: 'png' }));
        ctx.drawImage(avatar, pfpX - newPfpRadius + borderThickness, pfpY - newPfpRadius + borderThickness, newPfpRadius * 2, newPfpRadius * 2);
        ctx.restore();

        ctx.font = textFont;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        const textPosx = pfpX + pfpRadius + borderThickness + pfpPadding * 2;
        const textPosY = pfpY;

        let userName: string;
        switch (lb_nameType ?? default_lb_nameType) {
            default:
            case "tag": {
                userName = value.member.user.tag;

                if (value.member.user.discriminator === '0')
                    userName = value.member.user.username;
            } break;
            case "username": {
                userName = value.member.user.username;
            } break;
            case "nickname": {
                userName = value.member.nickname ?? value.member.user.username;
            } break;
        }

        const text = `${value.position + 1}. ${userName} | ${levelText}`;

        ctx.fillText(text, textPosx, textPosY);
        if (user && user.id === value.member.id) {
            underlineText(ctx, text, textPosx, textPosY);
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
