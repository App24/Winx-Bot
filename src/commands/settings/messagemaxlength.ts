import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";

class SetMaxLengthCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.availability=CommandAvailability.Guild
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guild.id, DEFAULT_SERVER_INFO);
        
        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {max: 1, time:1000*60*5},
            {customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set")},
            {customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get")}
        );

        collector.on("collect", async(interaction)=>{
            await interaction.update({components: []});
            if(interaction.customId==="set"){
                await interaction.editReply(Localisation.getTranslation("argument.reply.amount"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    const len=parseInt(msg.content);
                    if(isNaN(len)||len<=0) return <any> msg.reply(Localisation.getTranslation("error.invalid.number"));
                    if(len<serverInfo.minMessageLength) return cmdArgs.message.reply(Localisation.getTranslation("setmaxlength.error"));
                    serverInfo.maxMessageLength=len;
                    await ServerInfo.set(cmdArgs.guild.id, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("setmaxlength.set", serverInfo.maxMessageLength));
                });
            }
            else if(interaction.customId==="get"){
                interaction.editReply(Localisation.getTranslation("setmaxlength.get", serverInfo.maxMessageLength));
            }
        });
    }
}

export=SetMaxLengthCommand;