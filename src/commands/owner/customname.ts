import { MessageActionRow, MessageButton, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CustomNameUser } from "../../structs/databaseTypes/CustomName";
import { getStringReply } from "../../utils/ReplyUtils";

class CustomNameCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const CustomNames = BotUser.getDatabase(DatabaseType.CustomNames);

        const customNames: string[] = await CustomNames.keys();

        const customNameUsers: CustomNameUser[][] = await CustomNames.values();

        let row = this.getCustomNamesSelectMenu(customNames);

        cmdArgs.message.reply({ content: Localisation.getTranslation("generic.selectmenu.placeholder"), components: [row] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (i: MessageComponentInteraction) => i.user.id === cmdArgs.author.id, time: 1000 * 60 * 5 });

            collector.on("end", () => {
                const components = msg.components;
                if (components.length > 0) {
                    components.forEach(component => {
                        component.components.forEach(c => {
                            c.disabled = true;
                        });
                    });
                }
                msg.edit({ components: components });
            });

            let index;

            collector.on("collect", async (interaction) => {
                if (interaction.isSelectMenu()) {
                    if (interaction.customId === "customName") {
                        index = +interaction.values[0];
                        if (index >= 0) {
                            const row2 = new MessageActionRow();

                            row2.addComponents(
                                new MessageButton({ customId: "add", style: "PRIMARY", label: "Add" })
                            );

                            if (customNameUsers[index].length > 0) {
                                row2.addComponents(new MessageButton({ customId: "remove", style: "DANGER", label: "Remove" }));
                            }

                            row2.addComponents(
                                new MessageButton({ customId: "delete", style: "DANGER", label: "Delete" })
                            );

                            await interaction.update({ components: [row2] });
                        } else {
                            const { value: name, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.customname") });
                            if (name === undefined) return;
                            customNames.push(name);
                            customNameUsers.push([]);
                            CustomNames.set(name, []);
                            message.reply("Added!");
                            row = this.getCustomNamesSelectMenu(customNames);
                            await interaction.editReply({ components: [row] });
                        }
                    } else if (interaction.customId === "users") {
                        await interaction.update({ components: [row] });
                        const i = +interaction.values[0];
                        if (i >= 0) {
                            customNameUsers[index].splice(i, 1);
                            CustomNames.set(customNames[index], customNameUsers[index]);
                            msg.reply("Removed!");
                        }
                    }
                } else if (interaction.isButton()) {
                    if (interaction.customId === "add") {
                        await interaction.update({ components: [row] });
                        const { value: content, message } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.customnameuser") });
                        if (content === undefined) return;

                        const pieces = content.split(" ");
                        const mention = pieces[0];
                        const matches = mention.match(/^<@!?(\d+)>$/);

                        let id = mention;

                        if (matches) {
                            id = matches[1];
                        }

                        let label = id;

                        if (pieces.length > 1) {
                            label = pieces[1];
                        }

                        if (!customNameUsers[index].find(u => u.id == id)) {
                            customNameUsers[index].push({ id, label });
                            CustomNames.set(customNames[index], customNameUsers[index]);
                            message.reply("Added!");
                        } else {
                            message.reply("User already added!");
                        }
                    } else if (interaction.customId === "remove") {
                        const userOptions: MessageSelectOptionData[] = [];

                        customNameUsers[index].forEach((u, i) => {
                            userOptions.push({
                                label: u.label,
                                value: i.toString()
                            });
                        });

                        userOptions.push({
                            label: "Cancel",
                            value: "-1"
                        });

                        const row2 = new MessageActionRow()
                            .addComponents(new MessageSelectMenu({ custom_id: "users", placeholder: "Please select a user", options: userOptions }));
                        await interaction.update({ components: [row2] });
                    } else if (interaction.customId === "delete") {
                        CustomNames.delete(customNames[index]);
                        msg.reply("Deleted!");
                        customNames.splice(index, 1);
                        row = this.getCustomNamesSelectMenu(customNames);
                        await interaction.update({ components: [row] });
                    }
                }
            });
        });
    }

    getCustomNames(customNames: string[]) {
        const options: MessageSelectOptionData[] = [];

        options.push({
            label: "Add New Name",
            value: "-1"
        });

        customNames.forEach((customName, i) => {
            options.push({
                label: customName,
                value: i.toString(),
            });
        });

        return options;
    }

    getCustomNamesSelectMenu(customNames: string[]) {
        const options = this.getCustomNames(customNames);


        return new MessageActionRow()
            .addComponents(new MessageSelectMenu({ custom_id: "customName", placeholder: Localisation.getTranslation("generic.selectmenu.placeholder"), options }));
    }
}

export = CustomNameCommand;