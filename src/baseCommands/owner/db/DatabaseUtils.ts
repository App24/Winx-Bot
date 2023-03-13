import { ButtonStyle, AttachmentBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder } from "discord.js";
import { copyFileSync, existsSync, unlinkSync } from "fs";
import { zip } from "zip-a-folder";
import { BotUser } from "../../../BotClient";
import { DATABASE_FOLDER, DATABASE_BACKUP_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { createWhatToDoButtons } from "../../../utils/MessageButtonUtils";
import { backupDatabases } from "../../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class DatabaseUtilsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 2, time: 1000 * 60 * 5 }, buttons: [
                {
                    customId: "backup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.backup"),
                    onRun: ({ interaction }) => {
                        backupDatabases();
                        interaction.update({ content: Localisation.getTranslation("generic.done"), components: [] });
                    }
                },
                {
                    customId: "downloadbackup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.downloadbackup"), onRun: async ({ interaction }) => {
                        const file = "backup.zip";
                        await interaction.update(Localisation.getTranslation("downloaddb.wait"));
                        await zip(DATABASE_FOLDER, file);

                        await interaction.editReply({ content: "Backup", files: [new AttachmentBuilder(file)], components: [] });
                        unlinkSync(file);
                    }
                },
                {
                    customId: "restorebackup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.restorebackup"), onRun: async ({ interaction }) => {
                        if (!existsSync(DATABASE_BACKUP_FOLDER)) {
                            return cmdArgs.reply("restoredb.empty.backups");
                        }

                        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            new ButtonBuilder({ customId: "confirm", style: ButtonStyle.Success, label: Localisation.getTranslation("button.confirm") }),
                            new ButtonBuilder({ customId: "cancel", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.cancel") })
                        );

                        interaction.update({ content: Localisation.getTranslation("generic.confirmation"), components: [row] });
                    }
                },
                {
                    customId: "downloaddatabase", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.downloaddatabase"), onRun: async ({ interaction }) => {
                        const file = "databases.zip";
                        await interaction.update(Localisation.getTranslation("downloaddb.wait"));
                        await zip(DATABASE_FOLDER, file);

                        await interaction.editReply({ content: "Database", files: [new AttachmentBuilder(file)], components: [] });
                        unlinkSync(file);
                    }
                },
                {
                    hidden: true,
                    customId: "confirm", style: ButtonStyle.Primary, onRun: async ({ interaction }) => {
                        const values = Object.values(DatabaseType);
                        values.forEach((value) => {
                            copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
                        });

                        BotUser.loadDatabases();

                        interaction.update({ content: Localisation.getTranslation("generic.dobne"), components: [] });
                    }
                },
                {
                    hidden: true,
                    customId: "cancel", style: ButtonStyle.Primary, onRun: async ({ interaction }) =>
                        interaction.update({ content: Localisation.getTranslation("generic.canceled"), components: [] })
                }
            ]
        });
    }
}