import { createCanvas, loadImage } from "canvas";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, Guild, Message, MessageComponentInteraction, User } from "discord.js";
import { existsSync } from "fs";
import { Localisation } from "../localisation";
import { Fairy } from "../structs/fairy/Fairy";
import { getBotRoleColor } from "./GetterUtils";
import { SendTarget } from "./MessageButtonUtils";
import { asyncForEach, canvasToMessageAttachment } from "./Utils";

export async function editFairy(sendTarget: SendTarget, user: User, guild: Guild, fairy: Fairy): Promise<{ message: Message, finished: boolean }> {
    return new Promise<{ message: Message, finished: boolean }>(async (resolve) => {
        const embed = new EmbedBuilder();

        embed.setTitle(`Fairy: ${fairy.name}`);
        embed.setColor(await getBotRoleColor(guild));

        embed.setImage(`attachment://fairy.png`);

        let sendMessage;

        if (sendTarget instanceof Message || sendTarget instanceof MessageComponentInteraction || sendTarget instanceof CommandInteraction) {
            sendMessage = sendTarget.reply.bind(sendTarget);
            if (sendTarget instanceof MessageComponentInteraction || sendTarget instanceof CommandInteraction) {
                if (!sendTarget.deferred && !sendTarget.replied) {
                    if (sendTarget instanceof MessageComponentInteraction) {
                        await sendTarget.deferUpdate();
                    } else {
                        await sendTarget.deferReply();
                    }
                }
                sendMessage = sendTarget.followUp.bind(sendTarget);
            }
        } else {
            sendMessage = sendTarget.send.bind(sendTarget);
        }

        const row = new ActionRowBuilder();

        row.addComponents(new ButtonBuilder({ style: ButtonStyle.Success, label: Localisation.getTranslation("button.confirm"), customId: "confirm" }));

        const message = await sendMessage({ embeds: [embed], files: [canvasToMessageAttachment(await createFairyImage(fairy))], components: [row] });

        resolve({ message, finished: false });
    });
}

export async function createFairyImage(fairy: Fairy) {
    const parts = [
        fairy.wingsPart,
        fairy.bodyBase,
        fairy.lowerBodyPart,
        fairy.upperBodyPart,
        fairy.hairPart,
        fairy.bootsPart
    ];

    if (!existsSync(fairy.bodyBase.imageFile)) {
        return createCanvas(1, 1);
    }

    const bodyBaseImage = await loadImage(fairy.bodyBase.imageFile);

    const canvas = createCanvas(bodyBaseImage.width, bodyBaseImage.height);
    const ctx = canvas.getContext("2d");

    await asyncForEach(parts, async (part) => {
        if (!existsSync(part.imageFile)) return;

        const image = await loadImage(part.imageFile);

        ctx.drawImage(image, 0, 0);
    });

    return canvas;
}