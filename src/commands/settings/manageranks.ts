import { MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleFromMention, getBotRoleColor } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAvailable, CommandAccess, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_WINGS_DATA, RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getServerDatabase, asyncForEach, createMessageEmbed, downloadFile } from "../../utils/Utils";
import { createWhatToDoButtons, InteractiveButton } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";
import { capitalise } from "../../utils/FormatUtils";
import { WINGS_FOLDER } from "../../Constants";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";

class SetRankCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

        /*await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: [
                {
                    customId: "select",
                    placeholder: "Please select an option",
                    options: [
                        {
                            label: Localisation.getTranslation("button.rank"),
                            value: "rank",
                            onSelect: async ({ interaction, message }) => {
                                interaction.deferUpdate();
                                await createMessageSelection({
                                    sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: [
                                        {
                                            customId: "select",
                                            placeholder: "Please select an option",
                                            options: [
                                                {
                                                    label: Localisation.getTranslation("button.add"),
                                                    value: "add",
                                                    onSelect: async ({ interaction }) => {
                                                        await interaction.reply({ content: Localisation.getTranslation("argument.reply.level"), components: [] });
                                                        const reply = await interaction.fetchReply();
                                                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                                            const level = parseInt(msg.content);
                                                            if (isNaN(level) || level < 0) return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));

                                                            let rankLevel = ranks.find(rank => rank.level === level);

                                                            const reply = await msg.reply(Localisation.getTranslation("argument.reply.role"));
                                                            createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                                                const role = await getRoleFromMention(msg.content, cmdArgs.guild);
                                                                if (!role) return <any>msg.reply(Localisation.getTranslation("error.invalid.role"));
                                                                if (rankLevel) {
                                                                    const index = ranks.findIndex(rank => rank.level === rankLevel.level);
                                                                    rankLevel.level = level;
                                                                    rankLevel.roleId = role.id;
                                                                    ranks.splice(index, 1);
                                                                } else {
                                                                    rankLevel = new RankLevel(level, role.id);
                                                                }
                                                                ranks.push(rankLevel);
                                                                await Ranks.set(cmdArgs.guildId, ranks);
                                                                return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.set"));
                                                            });
                                                        });
                                                    }
                                                },
                                                {
                                                    label: Localisation.getTranslation("button.remove"),
                                                    value: "remove",
                                                    onSelect: null
                                                }
                                            ]
                                        }
                                    ]
                                });
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.gif"),
                            value: "gif",
                            onSelect: null
                        },
                        {
                            label: Localisation.getTranslation("button.wings"),
                            value: "wings",
                            onSelect: null
                        },
                        {
                            label: Localisation.getTranslation("button.list"),
                            value: "list",
                            onSelect: async ({ interaction }) => {
                                if (!ranks || !ranks.length) {
                                    return interaction.reply(Localisation.getTranslation("error.empty.ranks"));
                                }

                                ranks.sort((a, b) => a.level - b.level);
                                const data = [];
                                await asyncForEach(ranks, async (rank: RankLevel) => {
                                    data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
                                });

                                const embed = new MessageEmbed();
                                embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                                embed.setDescription(data.join("\n"));
                                await interaction.reply({ embeds: [embed] });
                            }
                        }
                    ]
                }
            ]
        });*/

        await createWhatToDoButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { time: 1000 * 60 * 5 }, buttons: [
                {
                    customId: "rank", style: "PRIMARY", label: Localisation.getTranslation("button.rank"), onRun: async ({ interaction, data }) => {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.add") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.remove") })
                        );

                        data.information = { type: EditType.Rank };

                        interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "gifs", style: "PRIMARY", label: Localisation.getTranslation("button.gif"), onRun: async ({ interaction, data }) => {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.add") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.remove") })
                        );

                        data.information = { type: EditType.Gif };

                        interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "wings", style: "PRIMARY", label: Localisation.getTranslation("button.wings"), onRun: async ({ interaction, data }) => {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.remove") })
                        );

                        data.information = { type: EditType.Wings };

                        interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "list", style: "PRIMARY", label: Localisation.getTranslation("button.list"), onRun: async ({ interaction, collector }) => {
                        if (!ranks || !ranks.length) {
                            await interaction.update({ components: [] });
                            return <any>interaction.editReply(Localisation.getTranslation("error.empty.ranks"));
                        }

                        ranks.sort((a, b) => a.level - b.level);
                        const data = [];
                        await asyncForEach(ranks, async (rank: RankLevel) => {
                            data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
                        });

                        const embed = new MessageEmbed();
                        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                        embed.setDescription(data.join("\n"));
                        await interaction.update({ components: [] });
                        cmdArgs.message.reply({ embeds: [embed] });
                        collector.emit("end", "");
                    }
                },
                {
                    hidden: true,
                    customId: "get", style: "PRIMARY", onRun: async ({ interaction, data, collector }) => {
                        if (!ranks || !ranks.length) return interaction.update({ content: "error.empty.ranks", components: [] });
                        await interaction.update({ content: Localisation.getTranslation("argument.reply.level"), components: [] });
                        const reply = await interaction.fetchReply();
                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                            const level = parseInt(msg.content);
                            if (isNaN(level) || level < 0) return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));

                            const rankLevelIndex = ranks.findIndex(rank => rank.level === level);
                            if (rankLevelIndex < 0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                            const rankLevel = ranks[rankLevelIndex];

                            const type: EditType = data.information.type;
                            switch (type) {
                                case EditType.Gif: {
                                    if (!rankLevel.gifs || !rankLevel.gifs.length) return cmdArgs.message.reply(Localisation.getTranslation("error.missing.gifs"));
                                    const embed = new MessageEmbed();
                                    const data = [];
                                    data.push(Localisation.getTranslation("setrank.list.role", rankLevel.roleId));
                                    data.push(Localisation.getTranslation("setrank.list.gifs"));
                                    rankLevel.gifs.forEach(gif => {
                                        data.push(gif);
                                    });
                                    embed.setDescription(data.join("\n"));
                                    cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
                                    collector.emit("end", "");
                                } break;
                                case EditType.Wings: {
                                    if (!rankLevel.wings) rankLevel.wings = DEFAULT_WINGS_DATA;

                                    const buttons: InteractiveButton[] = [];
                                    Object.keys(rankLevel.wings).forEach(name => {
                                        if (rankLevel.wings[name] !== "") {
                                            buttons.push({
                                                customId: name, style: "PRIMARY", label: capitalise(name), onRun: async ({ interaction }) => {
                                                    if (!existsSync(rankLevel.wings[name]))
                                                        return await interaction.editReply(Localisation.getTranslation("error.not.findfile"));

                                                    collector.emit("end", "");
                                                    await interaction.editReply({ content: Localisation.getTranslation("setrank.wings.get", capitalise(name)), files: [rankLevel.wings[name]] });
                                                }
                                            });
                                        }
                                    });
                                    if (buttons.length <= 0) {
                                        collector.emit("end", "");
                                        return msg.reply(Localisation.getTranslation("error.empty.wings"));
                                    }
                                    await createWhatToDoButtons({ sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 5 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons });
                                } break;
                            }
                        });
                    }
                },
                {
                    hidden: true,
                    customId: "set", style: "PRIMARY", onRun: async ({ interaction, data, collector }) => {
                        const type: EditType = data.information.type;
                        if (type === EditType.Rank) {
                            await interaction.update({ content: Localisation.getTranslation("argument.reply.level"), components: [] });
                            const reply = await interaction.fetchReply();
                            createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                const level = parseInt(msg.content);
                                if (isNaN(level) || level < 0) return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));

                                let rankLevel = ranks.find(rank => rank.level === level);

                                const reply = await msg.reply(Localisation.getTranslation("argument.reply.role"));
                                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                    const role = await getRoleFromMention(msg.content, cmdArgs.guild);
                                    if (!role) return <any>msg.reply(Localisation.getTranslation("error.invalid.role"));
                                    if (rankLevel) {
                                        const index = ranks.findIndex(rank => rank.level === rankLevel.level);
                                        rankLevel.level = level;
                                        rankLevel.roleId = role.id;
                                        ranks.splice(index, 1);
                                    } else {
                                        rankLevel = new RankLevel(level, role.id);
                                    }
                                    ranks.push(rankLevel);
                                    await Ranks.set(cmdArgs.guildId, ranks);
                                    collector.emit("end", "");
                                    return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.set"));
                                });
                            });
                        } else {
                            if (!ranks || !ranks.length) return interaction.update({ content: "error.empty.ranks", components: [] });
                            await interaction.update({ content: Localisation.getTranslation("argument.reply.level"), components: [] });
                            const reply = await interaction.fetchReply();
                            createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                const level = parseInt(msg.content);
                                if (isNaN(level) || level < 0) return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));

                                const rankLevelIndex = ranks.findIndex(rank => rank.level === level);
                                if (rankLevelIndex < 0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                                const rankLevel = ranks[rankLevelIndex];

                                switch (type) {
                                    case EditType.Gif: {
                                        const reply = await msg.reply(Localisation.getTranslation("argument.reply.gif"));
                                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                            msg.content.split(" ").forEach(gif => {
                                                rankLevel.gifs.push(gif.toLowerCase());
                                            });
                                            await Ranks.set(cmdArgs.guildId, ranks);
                                            cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.add"));
                                            collector.emit("end", "");
                                        });
                                    } break;
                                    case EditType.Wings: {
                                        if (!rankLevel.wings) rankLevel.wings = DEFAULT_WINGS_DATA;

                                        const reply = await msg.reply(Localisation.getTranslation("argument.reply.image"));
                                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                            const image: MessageAttachment = msg.attachments.first();
                                            if (!image) return <any>msg.reply(Localisation.getTranslation("error.missing.image"));

                                            if (!image.name.toLowerCase().endsWith(".png")) return msg.reply(Localisation.getTranslation("error.invalid.image"));

                                            const buttons: InteractiveButton[] = [];
                                            Object.keys(rankLevel.wings).forEach(name => {
                                                buttons.push({
                                                    customId: name, style: "PRIMARY", label: capitalise(name), onRun: async ({ interaction }) => {
                                                        const dir = `${WINGS_FOLDER}/${cmdArgs.guildId}/${rankLevel.level}`;
                                                        const filePath = `${dir}/${name}_${image.name}`;
                                                        if (!existsSync(dir)) {
                                                            mkdirSync(dir, { recursive: true });
                                                        }
                                                        if (existsSync(rankLevel.wings[name]))
                                                            unlinkSync(rankLevel.wings[name]);
                                                        const msg = await cmdArgs.message.reply("Downloading image...");
                                                        downloadFile(image.url, filePath, async () => {
                                                            rankLevel.wings[name] = filePath;
                                                            await msg.delete();
                                                            await interaction.editReply(Localisation.getTranslation("setrank.wings.add", capitalise(name)));
                                                            await Ranks.set(cmdArgs.guildId, ranks);
                                                        });
                                                    }
                                                });
                                            });
                                            await createWhatToDoButtons({ sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 5 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons });
                                        });
                                    } break;
                                }
                            });
                        }
                    }
                },
                {
                    hidden: true,
                    customId: "reset", style: "DANGER", onRun: async ({ interaction, data, collector }) => {
                        if (!ranks || !ranks.length) return interaction.update({ content: "error.empty.ranks", components: [] });
                        const type: EditType = data.information.type;
                        await interaction.update({ content: Localisation.getTranslation("argument.reply.level"), components: [] });
                        const reply = await interaction.fetchReply();
                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                            const level = parseInt(msg.content);
                            if (isNaN(level) || level < 0) return <any>msg.reply(Localisation.getTranslation("error.invalid.level"));

                            const rankLevelIndex = ranks.findIndex(rank => rank.level === level);
                            if (rankLevelIndex < 0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                            const rankLevel = ranks[rankLevelIndex];

                            switch (type) {
                                case EditType.Gif: {
                                    const reply = await msg.reply(Localisation.getTranslation("argument.reply.gif"));
                                    createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                        msg.content.split(" ").forEach(_gif => {
                                            const index = rankLevel.gifs.findIndex(gif => gif.toLowerCase() === _gif.toLowerCase());
                                            if (index > -1) rankLevel.gifs.splice(index, 1);
                                        });
                                        await Ranks.set(cmdArgs.guildId, ranks);
                                        cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.remove"));
                                        collector.emit("end", "");
                                    });
                                } break;
                                case EditType.Wings: {
                                    if (!rankLevel.wings) rankLevel.wings = DEFAULT_WINGS_DATA;

                                    const buttons: InteractiveButton[] = [];
                                    Object.keys(rankLevel.wings).forEach(name => {
                                        if (rankLevel.wings[name] !== "") {
                                            buttons.push({
                                                customId: name, style: "PRIMARY", label: capitalise(name), onRun: async ({ interaction }) => {
                                                    if (existsSync(rankLevel.wings[name]))
                                                        unlinkSync(rankLevel.wings[name]);
                                                    rankLevel.wings[name] = "";
                                                    await interaction.editReply(Localisation.getTranslation("setrank.wings.remove", capitalise(name)));
                                                    await Ranks.set(cmdArgs.guildId, ranks);
                                                    collector.emit("end", "");
                                                }
                                            });
                                        }
                                    });
                                    await createWhatToDoButtons({ sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 5 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons });
                                } break;
                                case EditType.Rank: {
                                    ranks.splice(rankLevelIndex, 1);
                                    await Ranks.set(cmdArgs.guildId, ranks);
                                    collector.emit("end", "");
                                    return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.remove"));
                                } break;
                            }
                        });
                    }
                }
            ]
        });

    }
}

enum EditType {
    Rank,
    Wings,
    Gif
}

export = SetRankCommand;