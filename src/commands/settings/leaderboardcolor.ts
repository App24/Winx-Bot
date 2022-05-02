import { MessageActionRow, MessageButton } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailable } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { canvasColor } from "../../utils/CanvasUtils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";
import { canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../utils/Utils";

class LeaderboardColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.GuildOwner;
        this.category = Settings;
        this.aliases = ["leaderboardcolour", "lbcolor", "lbcolour"];
        this.deprecated = true;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        await createWhatToDoButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { time: 1000 * 60 * 5 }, buttons: [
                {
                    customId: "background", style: "PRIMARY", label: Localisation.getTranslation("button.background"), onRun: async ({ interaction, data }) => {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.reset") })
                        );

                        data.information = { type: "background" };

                        interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "highlight", style: "PRIMARY", label: Localisation.getTranslation("button.highlight"), onRun: async ({ interaction, data }) => {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.reset") })
                        );

                        data.information = { type: "highlight" };

                        interaction.update({ components: [row] });
                    }
                },
                {
                    hidden: true,
                    customId: "get", style: "PRIMARY", onRun: async ({ interaction, collector, data }) => {
                        const hex = data.information.type === "background" ? serverInfo.leaderboardColor : serverInfo.leaderboardHighlight;
                        interaction.reply({ content: Localisation.getTranslation("generic.hexcolor", hex), files: [canvasToMessageAttachment(canvasColor(hex))] });
                        collector.emit("end", "");
                    }
                },
                {
                    hidden: true,
                    customId: "set", style: "PRIMARY", onRun: async ({ interaction, collector, data }) => {
                        collector.emit("end", "");
                        await interaction.reply(Localisation.getTranslation("argument.reply.hexcolor"));
                        const reply = await interaction.fetchReply();
                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                            const hex = msg.content;
                            if (!isHexColor(hex)) return <any>msg.reply(Localisation.getTranslation("error.invalid.hexcolor"));
                            switch (data.information.type) {
                                case "background":
                                    serverInfo.leaderboardColor = hex;
                                    break;
                                case "highlight":
                                    serverInfo.leaderboardHighlight = hex;
                                    break;
                            }
                            await ServerInfo.set(cmdArgs.guildId, serverInfo);
                            cmdArgs.message.reply(Localisation.getTranslation(`leaderboardcolor.set.${data.information.type === "background" ? "color" : "highlight"}`));
                        });
                    }
                },
                {
                    hidden: true,
                    customId: "reset", style: "DANGER", onRun: async ({ interaction, collector, data }) => {
                        switch (data.information.type) {
                            case "background":
                                serverInfo.leaderboardColor = DEFAULT_SERVER_INFO.leaderboardColor;
                                break;
                            case "highlight":
                                serverInfo.leaderboardHighlight = DEFAULT_SERVER_INFO.leaderboardHighlight;
                                break;
                        }
                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                        await interaction.update(Localisation.getTranslation(`leaderboardcolor.reset.${data.information.type === "background" ? "color" : "highlight"}`));
                        collector.emit("end", "");
                    }
                }
            ]
        });
    }
}

export = LeaderboardColorCommand;