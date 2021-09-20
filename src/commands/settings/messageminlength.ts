import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";

class SetMinLengthCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.access=CommandAccess.GuildOwner;
        this.available=CommandAvailable.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        
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
                    if(len>serverInfo.maxMessageLength) return cmdArgs.message.reply(Localisation.getTranslation("setminlength.error"));
                    serverInfo.minMessageLength=len;
                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("setminlength.set", serverInfo.minMessageLength));
                });
            }
            else if(interaction.customId==="get"){
                interaction.editReply(Localisation.getTranslation("setminlength.get", serverInfo.minMessageLength));
            }
        });
    }
}

export=SetMinLengthCommand;