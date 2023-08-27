import { createCanvas, loadImage } from "canvas";
import { DocumentWrapper, ModelWrapper } from "../structs/ModelWrapper";
import { FairyData } from "../structs/databaseTypes/FairyData";
import { Fairy } from "../structs/fairy/Fairy";
import { FairyPart, FairyPartType } from "../structs/fairy/FairyPart";
import { ButtonStyle, EmbedBuilder, Guild, TextInputStyle } from "discord.js";
import { InteractiveButton, SendTarget, createMessageButtons } from "./MessageButtonUtils";
import { createInteractionModal } from "./InteractionModalUtils";
import { asyncForEach, canvasToMessageAttachment, createMessageEmbed, getOneDatabase } from "./Utils";

export async function createFairy(userId: string, guild: Guild, sendTarget: SendTarget) {
    return new Promise<ModelWrapper<typeof FairyData.schema>>(async (resolve) => {
        createMessageButtons({
            sendTarget,
            author: userId,
            settings: { max: 1 },
            options: "Create Fairy",
            buttons: [
                {
                    customId: "create",
                    label: "Create",
                    style: ButtonStyle.Primary,
                    async onRun({ interaction }) {
                        createInteractionModal({
                            sendTarget: interaction,
                            title: "Fairy Name",
                            fields: { custom_id: "name", label: "Name", style: TextInputStyle.Short },
                            async onSubmit({ interaction, data }) {

                                const fairy = new FairyData({ userId });

                                fairy.name = data.information.name;

                                await fairy.save();

                                await editFairy(userId, guild, interaction);

                                resolve(new ModelWrapper(fairy));
                            },
                            onTimeout() {
                                resolve(new ModelWrapper(null));
                            }
                        });
                    }
                }
            ],
            onTimeout() {
                resolve(new ModelWrapper(null));
            }
        });
    });
}

export async function editFairy(userId: string, guild: Guild, sendTarget: SendTarget) {
    return new Promise<void>(async (resolve) => {
        const fairyData = await getOneDatabase(FairyData, { userId });

        if (fairyData.isNull()) {
            resolve();
        }

        let fairy = Fairy.from(fairyData);

        const embed = await createMessageEmbed(new EmbedBuilder(), guild);

        embed.setTitle(fairy.name);

        embed.setImage("attachment://fairy.png");

        const buttons: Partial<InteractiveButton>[] = [];

        await asyncForEach(Object.keys(FairyPartType).filter((item) => !isNaN(Number(item))).map(item => FairyPartType[item]).filter(item => item !== FairyPartType.Wings), async (type: FairyPartType) => {
            const parts = FairyPart.getByType(type);

            let index = parts.findIndex(p => p.id === fairy.getPart(type).id);

            /*console.log(parts.map(p => p.id));
            console.log(index);*/

            buttons.push({
                customId: type.toString(),
                label: type.toString(),
                style: ButtonStyle.Primary,
                async onRun({ interaction: originalInteraction }) {

                    const embed = await createMessageEmbed(new EmbedBuilder(), guild);

                    embed.setImage("attachment://fairy.png");

                    embed.setTitle(`${type} - ${parts[index].name} ${index + 1}/${parts.length}`);

                    createMessageButtons({
                        author: userId,
                        sendTarget: originalInteraction,
                        onTimeout: resolve,
                        buttons: [
                            {
                                customId: "previous",
                                label: "<",
                                style: ButtonStyle.Primary,
                                async onRun({ interaction }) {
                                    index--;
                                    if (index < 0) index = 0;
                                    fairy.setPart(type, parts[index]);

                                    embed.setTitle(`${type} - ${parts[index].name} ${index + 1}/${parts.length}`);

                                    interaction.update({ embeds: [embed], files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
                                }
                            },
                            {
                                customId: "save",
                                label: "Save",
                                style: ButtonStyle.Primary,
                                async onRun({ interaction }) {
                                    await interaction.deleteReply();
                                    originalInteraction.update({ files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
                                }
                            },
                            {
                                customId: "next",
                                label: ">",
                                style: ButtonStyle.Primary,
                                async onRun({ interaction }) {
                                    index++;
                                    if (index > parts.length) index = parts.length - 1;
                                    fairy.setPart(type, parts[index]);

                                    embed.setTitle(`${type} - ${parts[index].name} ${index + 1}/${parts.length}`);

                                    interaction.update({ embeds: [embed], files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
                                }
                            }
                        ],
                        options: {
                            embeds: [embed],
                            files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")]
                        }
                    });

                    //fairy = Fairy.from(fairyData);
                    //originalInteraction.update({ files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
                }
            });
        });

        buttons.push({
            customId: "save",
            label: "Save",
            style: ButtonStyle.Primary,
            async onRun({ interaction, collector }) {
                fairy = Fairy.from(fairyData);
                await interaction.update({ files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")] });
                collector.emit("end", null, "clicked");
                resolve();
            },
        });

        createMessageButtons({
            sendTarget,
            author: userId,
            onTimeout: () => resolve(),
            options: {
                embeds: [embed],
                files: [canvasToMessageAttachment(await getFairyImage(fairy), "fairy")]
            },
            buttons
        });
    });
}

export async function getFairyPartImage(part: FairyPart) {
    return loadImage(part.imageFile);
}

export async function getFairyImage(fairy: Fairy) {
    const bodyBaseImage = await getFairyPartImage(fairy.bodyBase);

    const canvas = createCanvas(bodyBaseImage.width, bodyBaseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(await getFairyPartImage(fairy.wingsPart), 0, 0);
    ctx.drawImage(bodyBaseImage, 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.hairPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.eyesPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.nosePart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.lipsPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.shirtPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.glovesPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.skirtPart), 0, 0);
    ctx.drawImage(await getFairyPartImage(fairy.bootsPart), 0, 0);

    return canvas;
}