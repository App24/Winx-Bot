import fs from "fs";
import { Message } from "discord.js";
import { BotUser } from "../../../BotClient";
import { DATABASE_BACKUP_FOLDER, DATABASE_FOLDER, OWNER_ID } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess } from "../../../structs/Command";
import { DatabaseType } from "../../../structs/DatabaseTypes";

class RestoreDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        if(!fs.existsSync(DATABASE_BACKUP_FOLDER)){
            return message.reply(Localisation.getTranslation("restoredb.empty.backups"));
        }
        
        message.channel.send(Localisation.getTranslation("generic.confirmation")).then(async(msg)=>{
            msg.react('✅');
            msg.react('❌');
            const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===OWNER_ID), {max: 1});

            collector.on("end", async()=>{
                msg.reactions.removeAll();
            })

            collector.on("collect", async(reaction)=>{
                if(reaction.emoji.name==="✅"){
                    const values = Object.values(DatabaseType);
                    values.forEach((value, index)=>{
                        fs.copyFileSync(`${DATABASE_BACKUP_FOLDER}/${value}.sqlite`, `${DATABASE_FOLDER}/${value}.sqlite`);
                    });

                    BotUser.loadDatabases();

                    message.channel.send(Localisation.getTranslation("generic.done"));
                }else if(reaction.emoji.name==="❌"){
                    message.channel.send(Localisation.getTranslation("generic.canceled"));
                }
            });
        });
    }
}

export=RestoreDBCommand;