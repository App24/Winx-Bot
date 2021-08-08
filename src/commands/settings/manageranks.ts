import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getRoleFromMention, getRoleById, getBotRoleColor } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandAvailability, CommandAccess, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";

class SetRankCommand extends Command{
    public constructor(){
        super();
        this.category=Settings;
        this.availability=CommandAvailability.Guild;
        this.access=CommandAccess.Moderators;
    }

    public async onRun(cmdArgs : CommandArguments){
        const Ranks=BotUser.getDatabase(DatabaseType.Ranks);
        const ranks:RankLevel[]=await getServerDatabase(Ranks, cmdArgs.guild.id);

        const collector=await createWhatToDoButtons(cmdArgs.message, cmdArgs.author, {time: 1000*60*5},
            {customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.add")},
            {customId: "remove", style: "PRIMARY", label: Localisation.getTranslation("button.remove")},
            {customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get")},
            {customId: "list", style: "PRIMARY", label: Localisation.getTranslation("button.list")}
        );

        collector.on("collect", async(interaction)=>{
            switch(interaction.customId){
                case "list":{
                    if(!ranks||!ranks.length) return <any>interaction.update(Localisation.getTranslation("error.empty.ranks"));

                    ranks.sort((a, b)=>a.level-b.level);
                    const data=[];
                    await asyncForEach(ranks, async(rank:RankLevel)=>{
                        data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
                    });

                    const embed=new MessageEmbed();
                    embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                    embed.setDescription(data.join("\n"));
                    interaction.update({components: []});
                    cmdArgs.message.reply({embeds: [embed]});
                }break;
                case "get":{
                    if(!ranks||!ranks.length) return interaction.update({content: "error.empty.ranks", components: []});
                    await interaction.update({content: Localisation.getTranslation("argument.reply.level"), components: []});
                    const reply=await interaction.fetchReply();
                    cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                        const level=parseInt(msg.content);
                        if(isNaN(level)||level<0) return <any> msg.reply(Localisation.getTranslation("error.invalid.level"));

                        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
                        if(rankLevelIndex<0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                        const rankLevel=ranks[rankLevelIndex];

                        const embed=new MessageEmbed();
                        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                        const data=[];
                        data.push(Localisation.getTranslation("setrank.list.role", rankLevel.roleId));
                        if(rankLevel.gifs&&rankLevel.gifs.length){
                            data.push(Localisation.getTranslation("setrank.list.gifs"));
                            rankLevel.gifs.forEach(gif=>{
                                data.push(gif);
                            });
                        }
                        embed.setDescription(data.join("\n"));
                        cmdArgs.message.reply({embeds: [embed]});
                    });
                }break;
                case "set":{
                    const row=new MessageActionRow().addComponents(
                        new MessageButton({customId: "aRole", style: "PRIMARY", label: Localisation.getTranslation("button.rank")}),
                        new MessageButton({customId: "aGif", style: "PRIMARY", label: Localisation.getTranslation("button.gif")})
                    );
                    await interaction.update({content: Localisation.getTranslation("generic.whattoadd"), components: [row]});
                }break;
                case "remove":{
                    if(!ranks||!ranks.length) return interaction.update({content: "error.empty.ranks", components: []});
                    const row=new MessageActionRow().addComponents(
                        new MessageButton({customId: "rRole", style: "PRIMARY", label: Localisation.getTranslation("button.rank")}),
                        new MessageButton({customId: "rGif", style: "PRIMARY", label: Localisation.getTranslation("button.gif")})
                    );
                    await interaction.update({content: Localisation.getTranslation("generic.whattoremove"), components: [row]});
                }break;

                case "rRole":{
                    await interaction.update({content: Localisation.getTranslation("argument.reply.level"), components: []});
                    const reply=await interaction.fetchReply();
                    cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                        const level=parseInt(msg.content);
                        if(isNaN(level)||level<0) return <any> msg.reply(Localisation.getTranslation("error.invalid.level"));

                        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
                        if(rankLevelIndex<0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                        const rankLevel=ranks[rankLevelIndex];
                        
                        ranks.splice(rankLevelIndex, 1);
                        await Ranks.set(cmdArgs.guild.id, ranks);
                        return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.remove"));
                    });
                }break;
                case "rGif":{
                    await interaction.update({content: Localisation.getTranslation("argument.reply.level"), components: []});
                    const reply=await interaction.fetchReply();
                    cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                        const level=parseInt(msg.content);
                        if(isNaN(level)||level<0) return <any> msg.reply(Localisation.getTranslation("error.invalid.level"));

                        const rankLevelIndex=ranks.findIndex(rank=>rank.level===level);
                        if(rankLevelIndex<0) return msg.reply(Localisation.getTranslation("error.missing.rank"));
                        const rankLevel=ranks[rankLevelIndex];
                        
                        const reply=await msg.reply(Localisation.getTranslation("argument.reply.gif"));
                        cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                            msg.content.split(" ").forEach(_gif=>{
                                const index=rankLevel.gifs.findIndex(gif=>gif.toLowerCase()===_gif.toLowerCase());
                                if(index>-1) rankLevel.gifs.splice(index, 1);
                            })
                            await Ranks.set(cmdArgs.guild.id, ranks);
                            cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.remove"));
                        });
                    });
                }break;

                case "aRole":{
                    await interaction.update({content: Localisation.getTranslation("argument.reply.level"), components: []});
                    const reply=await interaction.fetchReply();
                    cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                        const level=parseInt(msg.content);
                        if(isNaN(level)||level<0) return <any> msg.reply(Localisation.getTranslation("error.invalid.level"));

                        let rankLevel=ranks.find(rank=>rank.level===level);
                        
                        const reply=await msg.reply(Localisation.getTranslation("argument.reply.role"));
                        cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                            const role=await getRoleFromMention(msg.content, cmdArgs.guild);
                            if(!role) return <any> msg.reply(Localisation.getTranslation("error.invalid.role"));
                            if(rankLevel){
                                const index=ranks.findIndex(rank=>rank.level===rankLevel.level);
                                rankLevel.level=level;
                                rankLevel.roleId=role.id;
                                ranks.splice(index, 1);
                            }else{
                                rankLevel=new RankLevel(level, role.id);
                            }
                            ranks.push(rankLevel);
                            await Ranks.set(cmdArgs.guild.id, ranks);
                            return cmdArgs.message.reply(Localisation.getTranslation("setrank.role.set"));
                        });
                    });
                }break;
                case "aGif":{
                    await interaction.update({content: Localisation.getTranslation("argument.reply.level"), components: []});
                    const reply=await interaction.fetchReply();
                    cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                        const level=parseInt(msg.content);
                        if(isNaN(level)||level<0) return <any> msg.reply(Localisation.getTranslation("error.invalid.level"));

                        let rankLevel=ranks.find(rank=>rank.level===level);
                        if(!rankLevel) return msg.reply(Localisation.getTranslation("setrank.gifs.norole"));
                        
                        const reply=await msg.reply(Localisation.getTranslation("argument.reply.gif"));
                        cmdArgs.channel.createMessageCollector({filter: m=>m.reference&&m.reference.messageId===reply.id&&m.author.id===cmdArgs.author.id, max:1, time:1000*60*5}).on("collect", async(msg)=>{
                            msg.content.split(" ").forEach(gif=>{
                                rankLevel.gifs.push(gif.toLowerCase());
                            })
                            await Ranks.set(cmdArgs.guild.id, ranks);
                            cmdArgs.message.reply(Localisation.getTranslation("setrank.gifs.add"));
                        });
                    });
                }break;
            }
        });

    }
}

export=SetRankCommand;