import { ButtonInteraction, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getBotRoleColor, GetTextNewsGuildChannelFromMention } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../utils/MessageUtils";

class ExcludeChannelCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.access=CommandAccess.Moderators;
        this.available=CommandAvailable.Guild;
    }

    public async onRun(cmdArgs : CommandArguments){
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo:ServerInfo=await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {max: 1, time: 1000*60*5},
            {customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.add")},
            {customId: "remove", style: "PRIMARY", label: Localisation.getTranslation("button.remove")},
            {customId: "clear", style: "PRIMARY", label: Localisation.getTranslation("button.cleardeletedchannels")},
            {customId: "list", style: "PRIMARY", label: Localisation.getTranslation("button.list")}
        );

        collector.on("collect", async(interaction:ButtonInteraction)=>{
            await interaction.update({components: []});
            if(interaction.customId==="set"){
                await interaction.editReply(Localisation.getTranslation("argument.reply.channel"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    if(!serverInfo.excludeChannels) serverInfo.excludeChannels=[];

                    const channel=await GetTextNewsGuildChannelFromMention(msg.content, cmdArgs.guild);
                    if(!channel) return <any> msg.reply(Localisation.getTranslation("error.invalid.channel"));
                    
                    if(serverInfo.excludeChannels.find(c=>c===channel.id)) return msg.reply(Localisation.getTranslation("excludechannel.channel.already"));

                    serverInfo.excludeChannels.push(channel.id);

                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("excludechannel.add", channel));
                });
            }
            else if(interaction.customId==="remove"){
                await interaction.editReply(Localisation.getTranslation("argument.reply.channel"));
                const reply=await interaction.fetchReply();
                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, {max: 1, time: 1000*60*5}).on("collect", async(msg)=>{
                    if(!serverInfo.excludeChannels||!serverInfo.excludeChannels.length) return <any> msg.reply(Localisation.getTranslation("error.empty.excludedchannels"));

                    const channel=await GetTextNewsGuildChannelFromMention(msg.content, cmdArgs.guild);
                    if(!channel) return msg.reply(Localisation.getTranslation("error.invalid.channel"));

                    if(!serverInfo.excludeChannels.find(c=>c===channel.id)) return msg.reply(Localisation.getTranslation("excludechannel.channel.not"));

                    const index=serverInfo.excludeChannels.findIndex(c=>c===channel.id);
                    if(index>=0) serverInfo.excludeChannels.splice(index, 1);

                    await ServerInfo.set(cmdArgs.guildId, serverInfo);
                    cmdArgs.message.reply(Localisation.getTranslation("excludechannel.remove", channel));
                });
            }else if(interaction.customId==="clear"){
                if(!serverInfo.excludeChannels||!serverInfo.excludeChannels.length) return <any> cmdArgs.message.reply(Localisation.getTranslation("error.empty.excludedchannels"));
                const data=[];
                await asyncForEach(serverInfo.excludeChannels, async(excludedChannel:string)=>{
                    const channel=await GetTextNewsGuildChannelFromMention(excludedChannel, cmdArgs.guild);
                    if(!channel){
                        data.push(excludedChannel);
                    }
                });
                data.forEach(channel=>{
                    const index=serverInfo.excludeChannels.findIndex(c=>c===channel);
                    if(index>-1) serverInfo.excludeChannels.splice(index, 1);
                });
                await ServerInfo.set(cmdArgs.guildId, serverInfo);
                cmdArgs.message.reply(Localisation.getTranslation("excludechannel.clear"));
            }else if(interaction.customId==="list"){
                if(!serverInfo.excludeChannels||!serverInfo.excludeChannels.length) return <any> cmdArgs.message.reply(Localisation.getTranslation("error.empty.excludedchannels"));
                const data=[];
                await asyncForEach(serverInfo.excludeChannels, async(excludedChannel:string)=>{
                    const channel=await GetTextNewsGuildChannelFromMention(excludedChannel, cmdArgs.guild);
                    if(channel){
                        data.push(channel);
                    }
                });
                const embed=new MessageEmbed();
                embed.setDescription(data.join("\n"));
                embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                cmdArgs.message.reply({embeds: [embed]});
            }
        });
    }
}

export=ExcludeChannelCommand;