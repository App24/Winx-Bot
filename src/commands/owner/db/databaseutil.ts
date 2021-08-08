import { MessageActionRow, MessageAttachment, MessageButton } from "discord.js";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER, OWNER_ID } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../../structs/Command";
import { backupDatabases } from "../../../utils/Utils";
import fs from "fs";
import archiver from "archiver";
import { BotUser } from "../../../BotClient";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { createWhatToDoButtons } from "../../../utils/MessageButtonUtils";

class DatabaseUtilCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
        this.aliases=["backuputil", "databaseutils", "backuputils", "dbutil", "dbutils"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {max: 1, time: 1000*60*5}, 
            {customId: "backup", style: "PRIMARY", label: Localisation.getTranslation("button.backup")},
            {customId: "downloadbackup", style: "PRIMARY", label: Localisation.getTranslation("button.downloadbackup")},
            {customId: "restorebackup", style: "PRIMARY", label: Localisation.getTranslation("button.restorebackup")},
            {customId: "downloaddatabase", style: "PRIMARY", label: Localisation.getTranslation("button.downloaddatabase")}
        );

        collector.on("collect", async(interaction)=>{
            switch(interaction.customId){
                case "backup":{
                    backupDatabases();
                    interaction.update({content: Localisation.getTranslation("generic.done"), components: []});
                }break;
                case "downloadbackup":{
                    const file="backup.zip";
                    const output=fs.createWriteStream(file);
                    const archive=archiver("zip");
                    archive.on("error", (err)=>{
                        throw err;
                    });
                    
                    await interaction.update(Localisation.getTranslation("downloaddb.wait"));

                    archive.directory(DATABASE_BACKUP_FOLDER, false);

                    archive.pipe(output);

                    await archive.finalize();

                    await interaction.editReply({content: "Backup", files: [new MessageAttachment(file)], components: []});
                    fs.unlinkSync(file);
                }break;
                case "restorebackup":{
                    if(!fs.existsSync(DATABASE_BACKUP_FOLDER)){
                        return <any>cmdArgs.message.reply(Localisation.getTranslation("restoredb.empty.backups"));
                    }

                    const row=new MessageActionRow().addComponents(
                        new MessageButton({customId: "confirm", style: "SUCCESS", label: Localisation.getTranslation("button.confirm")}),
                        new MessageButton({customId: "cancel", style: "DANGER", label: Localisation.getTranslation("button.cancel")})
                    );

                    interaction.update({content: Localisation.getTranslation("generic.confirmation"), components: [row]});
                }break;
                case "downloaddatabase":{
                    const file="databases.zip";
                    const output=fs.createWriteStream(file);
                    const archive=archiver("zip");
                    archive.on("error", (err)=>{
                        throw err;
                    });
                    
                    await interaction.update(Localisation.getTranslation("downloaddb.wait"));

                    archive.directory(DATABASE_FOLDER, false);

                    archive.pipe(output);

                    await archive.finalize();

                    await interaction.editReply({content: "Database", files: [new MessageAttachment(file)], components: []});
                    fs.unlinkSync(file);
                }break;

                case "confirm":{
                    const values = Object.values(DatabaseType);
                    values.forEach((value, index)=>{
                        fs.copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
                    });

                    BotUser.loadDatabases();

                    interaction.update({content: Localisation.getTranslation("generic.dobne"), components: []});
                }break;
                case "cancel":{
                    interaction.update({content: Localisation.getTranslation("generic.canceled"), components: []});
                }break;
            }
        });
    }
}

export=DatabaseUtilCommand;