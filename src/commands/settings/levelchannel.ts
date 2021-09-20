import { BotUser } from "../../BotClient";
import { GetTextNewsGuildChannelFromMention } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";

class LevelChannelCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.access=CommandAccess.Moderators;
        this.availability=CommandAvailability.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);
        
        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {time: 1000*60*5, max: 1},
            {customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set")},
            {customId: "remove", style: "PRIMARY", label: Localisation.getTranslation("button.clear")},
            {customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get")}
        );

        collector.on("collect", async(interaction)=>{
            await interaction.update({components: []});
            if(interaction.customId==="set"){
                await interaction.editReply(Localisation.getTranslation("argument.reply.channel"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    const channel=await GetTextNewsGuildChannelFromMention(msg.content, cmdArgs.guild);
                    if(!channel) return <any> msg.reply(Localisation.getTranslation("error.invalid.channel"));

                    serverInfo.levelChannel=channel.id;

                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("levelchannel.set", channel));
                });
            }
            else if(interaction.customId==="get"){
                if(!serverInfo.levelChannel) return <any> cmdArgs.message.reply(Localisation.getTranslation("error.empty.levelchannel"));
                const channel=await GetTextNewsGuildChannelFromMention(serverInfo.levelChannel, cmdArgs.guild);
                if(!channel) return cmdArgs.message.reply(Localisation.getTranslation("levelchannel.missing.channel"));
                cmdArgs.message.reply(`${channel}`);
            }else if(interaction.customId==="remove"){
                if(!serverInfo.levelChannel) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levelchannel"));

                serverInfo.levelChannel="";

                await ServerInfo.set(cmdArgs.guildId, serverInfo);

                cmdArgs.message.reply(Localisation.getTranslation("levelchannel.remove"));
            }
        });
    }
}

export=LevelChannelCommand;