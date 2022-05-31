import { ButtonInteraction, Message, MessageActionRow, MessageAttachment, MessageButton } from "discord.js";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { Owner } from "../../../structs/Category";
import { Command, CommandArguments } from "../../../structs/Command";
import { CommandAccess } from "../../../structs/CommandAccess";
import { backupDatabases } from "../../../utils/Utils";
import fs from "fs";
import { BotUser } from "../../../BotClient";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { createWhatToDoButtons } from "../../../utils/MessageButtonUtils";
import { zip } from "zip-a-folder";

class DatabaseUtilCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;
        this.aliases = ["backuputil", "databaseutils", "backuputils", "dbutil", "dbutils"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        await createWhatToDoButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 2, time: 1000 * 60 * 5 }, buttons: [
                {
                    customId: "backup", style: "PRIMARY", label: Localisation.getTranslation("button.backup"),
                    onRun: ({ interaction }) => {
                        backupDatabases();
                        interaction.update({ content: Localisation.getTranslation("generic.done"), components: [] });
                    }
                },
                {
                    customId: "downloadbackup", style: "PRIMARY", label: Localisation.getTranslation("button.downloadbackup"), onRun: async ({ interaction }) => {
                        const file = "backup.zip";
                        await interaction.update(Localisation.getTranslation("downloaddb.wait"));
                        await zip(DATABASE_FOLDER, file);

                        await interaction.editReply({ content: "Backup", files: [new MessageAttachment(file)], components: [] });
                        fs.unlinkSync(file);
                    }
                },
                {
                    customId: "restorebackup", style: "PRIMARY", label: Localisation.getTranslation("button.restorebackup"), onRun: async ({ interaction }) => {
                        if (!fs.existsSync(DATABASE_BACKUP_FOLDER)) {
                            return <any>cmdArgs.message.reply(Localisation.getTranslation("restoredb.empty.backups"));
                        }

                        const row = new MessageActionRow().addComponents(
                            new MessageButton({ customId: "confirm", style: "SUCCESS", label: Localisation.getTranslation("button.confirm") }),
                            new MessageButton({ customId: "cancel", style: "DANGER", label: Localisation.getTranslation("button.cancel") })
                        );

                        interaction.update({ content: Localisation.getTranslation("generic.confirmation"), components: [row] });
                    }
                },
                {
                    customId: "downloaddatabase", style: "PRIMARY", label: Localisation.getTranslation("button.downloaddatabase"), onRun: async ({ interaction }) => {
                        const file = "databases.zip";
                        await interaction.update(Localisation.getTranslation("downloaddb.wait"));
                        await zip(DATABASE_FOLDER, file);

                        await interaction.editReply({ content: "Database", files: [new MessageAttachment(file)], components: [] });
                        fs.unlinkSync(file);
                    }
                },
                {
                    hidden: true,
                    customId: "confirm", style: "PRIMARY", onRun: async ({ interaction }) => {
                        const values = Object.values(DatabaseType);
                        values.forEach((value) => {
                            fs.copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
                        });

                        BotUser.loadDatabases();

                        interaction.update({ content: Localisation.getTranslation("generic.dobne"), components: [] });
                    }
                },
                {
                    hidden: true,
                    customId: "cancel", style: "PRIMARY", onRun: async ({ interaction }) =>
                        interaction.update({ content: Localisation.getTranslation("generic.canceled"), components: [] })
                }
            ]
        });
    }

    async backup(interaction: ButtonInteraction) {
        backupDatabases();
        await interaction.update({ content: Localisation.getTranslation("generic.done"), components: [] });
    }

    async downloadBackup(interaction: ButtonInteraction) {
        const file = "backup.zip";
        await interaction.update(Localisation.getTranslation("downloaddb.wait"));
        await zip(DATABASE_FOLDER, file);

        await interaction.editReply({ content: "Backup", files: [new MessageAttachment(file)], components: [] });
        fs.unlinkSync(file);
    }

    async restoreDatabase(interaction: ButtonInteraction, message: Message) {
        if (!fs.existsSync(DATABASE_BACKUP_FOLDER)) {
            return message.reply(Localisation.getTranslation("restoredb.empty.backups"));
        }

        const row = new MessageActionRow().addComponents(
            new MessageButton({ customId: "confirm", style: "SUCCESS", label: Localisation.getTranslation("button.confirm") }),
            new MessageButton({ customId: "cancel", style: "DANGER", label: Localisation.getTranslation("button.cancel") })
        );

        interaction.update({ content: Localisation.getTranslation("generic.confirmation"), components: [row] });
    }
}

export = DatabaseUtilCommand;