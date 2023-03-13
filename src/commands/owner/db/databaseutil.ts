import { ButtonInteraction, Message, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
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
import { DatabaseUtilsBaseCommand } from "../../../baseCommands/owner/db/DatabaseUtils";

class DatabaseUtilCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
        this.category = Owner;
        this.aliases = ["backuputil", "databaseutils", "backuputils", "dbutil", "dbutils"];

        this.baseCommand = new DatabaseUtilsBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     await createWhatToDoButtons({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 2, time: 1000 * 60 * 5 }, buttons: [
    //             {
    //                 customId: "backup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.backup"),
    //                 onRun: ({ interaction }) => {
    //                     backupDatabases();
    //                     interaction.update({ content: Localisation.getTranslation("generic.done"), components: [] });
    //                 }
    //             },
    //             {
    //                 customId: "downloadbackup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.downloadbackup"), onRun: async ({ interaction }) => {
    //                     const file = "backup.zip";
    //                     await interaction.update(Localisation.getTranslation("downloaddb.wait"));
    //                     await zip(DATABASE_FOLDER, file);

    //                     await interaction.editReply({ content: "Backup", files: [new AttachmentBuilder(file)], components: [] });
    //                     fs.unlinkSync(file);
    //                 }
    //             },
    //             {
    //                 customId: "restorebackup", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.restorebackup"), onRun: async ({ interaction }) => {
    //                     if (!fs.existsSync(DATABASE_BACKUP_FOLDER)) {
    //                         return <any>cmdArgs.message.reply(Localisation.getTranslation("restoredb.empty.backups"));
    //                     }

    //                     const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    //                         new ButtonBuilder({ customId: "confirm", style: ButtonStyle.Success, label: Localisation.getTranslation("button.confirm") }),
    //                         new ButtonBuilder({ customId: "cancel", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.cancel") })
    //                     );

    //                     interaction.update({ content: Localisation.getTranslation("generic.confirmation"), components: [row] });
    //                 }
    //             },
    //             {
    //                 customId: "downloaddatabase", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.downloaddatabase"), onRun: async ({ interaction }) => {
    //                     const file = "databases.zip";
    //                     await interaction.update(Localisation.getTranslation("downloaddb.wait"));
    //                     await zip(DATABASE_FOLDER, file);

    //                     await interaction.editReply({ content: "Database", files: [new AttachmentBuilder(file)], components: [] });
    //                     fs.unlinkSync(file);
    //                 }
    //             },
    //             {
    //                 hidden: true,
    //                 customId: "confirm", style: ButtonStyle.Primary, onRun: async ({ interaction }) => {
    //                     const values = Object.values(DatabaseType);
    //                     values.forEach((value) => {
    //                         fs.copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
    //                     });

    //                     BotUser.loadDatabases();

    //                     interaction.update({ content: Localisation.getTranslation("generic.dobne"), components: [] });
    //                 }
    //             },
    //             {
    //                 hidden: true,
    //                 customId: "cancel", style: ButtonStyle.Primary, onRun: async ({ interaction }) =>
    //                     interaction.update({ content: Localisation.getTranslation("generic.canceled"), components: [] })
    //             }
    //         ]
    //     });
    // }

    // async backup(interaction: ButtonInteraction) {
    //     backupDatabases();
    //     await interaction.update({ content: Localisation.getTranslation("generic.done"), components: [] });
    // }

    // async downloadBackup(interaction: ButtonInteraction) {
    //     const file = "backup.zip";
    //     await interaction.update(Localisation.getTranslation("downloaddb.wait"));
    //     await zip(DATABASE_FOLDER, file);

    //     await interaction.editReply({ content: "Backup", files: [new AttachmentBuilder(file)], components: [] });
    //     fs.unlinkSync(file);
    // }

    // async restoreDatabase(interaction: ButtonInteraction, message: Message) {
    //     if (!fs.existsSync(DATABASE_BACKUP_FOLDER)) {
    //         return message.reply(Localisation.getTranslation("restoredb.empty.backups"));
    //     }

    //     const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    //         new ButtonBuilder({ customId: "confirm", style: ButtonStyle.Success, label: Localisation.getTranslation("button.confirm") }),
    //         new ButtonBuilder({ customId: "cancel", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.cancel") })
    //     );

    //     interaction.update({ content: Localisation.getTranslation("generic.confirmation"), components: [row] });
    // }
}

export = DatabaseUtilCommand;