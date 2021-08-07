import { TextChannel, Guild, MessageEmbed, MessageActionRow, MessageButton, BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { SUGGESTION_CHANNEL, OWNER_ID } from "../../Constants";
import { getGuildByID, GetTextBasedGuildGuildChannelById } from "../../GetterUtils";
import { Localisation } from "../../localisation";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionStruct, SuggestionState } from "../../structs/databaseTypes/SuggestionStruct";
import { getBotRoleColor, genRanHex, isDM } from "../../Utils";

class SuggestionCommand extends Command{
    public constructor(){
        super();
        this.minArgs=1;
        this.usage=[new CommandUsage(true, "argument.suggestion")];
        this.aliases=["suggest"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const promises = [
            BotUser.shard.broadcastEval((client, {suggestion_channel})=>client.channels.fetch(suggestion_channel).catch(console.error), {context: {suggestion_channel: SUGGESTION_CHANNEL}})
        ];

        Promise.all(promises).then(async(results)=>{
            const channeld:any=results[0].reduce((acc,curr)=>{if(curr!==undefined) acc=curr;});
            let channel:BaseGuildTextChannel;
            if(!isDM(cmdArgs.channel)&&channeld["guild"]===cmdArgs.guild.id){
                channel=await GetTextBasedGuildGuildChannelById(SUGGESTION_CHANNEL, cmdArgs.guild);
            }else{
                channel=new TextChannel(await getGuildByID(channeld["guild"]), channeld);
            }
            const user=cmdArgs.author;
            const request=cmdArgs.args.join(" ");
            const text=Localisation.getTranslation("suggestion.request", user, request);
            const embed=new MessageEmbed();
            embed.setDescription(text);
            embed.setTimestamp();
            embed.setFooter(user.tag, user.displayAvatarURL());
            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
            cmdArgs.message.reply(Localisation.getTranslation("generic.sent"));

            const row=new MessageActionRow()
                      .addComponents(
                            new MessageButton({customId: "accept", style: "SUCCESS", label: "Accept"}),
                            new MessageButton({customId: "deny", style: "DANGER", label: "Deny"})
                      )

            channel.send({embeds: [embed], components: [row]}).then(async(msg)=>{
                const collector=msg.createMessageComponentCollector({filter: (interaction)=>interaction.user.id===OWNER_ID, max: 1});

                collector.on("collect", async(interaction)=>{
                    if(interaction.customId==="accept"){
                        const embed=msg.embeds[0];
                        embed.setTitle(Localisation.getTranslation("generic.accepted"));
                        interaction.update({embeds: [embed], components: []});
                        const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
                        let hex=genRanHex(16);
                        let suggestions=await Suggestions.get(hex);
                        while(suggestions){
                            hex=genRanHex(16);
                            suggestions=await Suggestions.get(hex);
                        }
                        const suggestion=new SuggestionStruct();

                        suggestion.userId=user.id;
                        suggestion.request=request;
                        suggestion.state=SuggestionState.Non;

                        await Suggestions.set(hex, suggestion);
                    }else if(interaction.customId==="deny"){
                        const embed=msg.embeds[0];
                        embed.setTitle(Localisation.getTranslation("generic.rejected"));
                        interaction.update({embeds: [embed], components: []});
                    }
                })

                // msg.react('✅');
                // msg.react('❌');
                // const collector=msg.createReactionCollector({filter: (reaction, _user)=>(['✅', "❌"].includes(reaction.emoji.name) && _user.id===OWNER_ID), max: 1});
    
                // collector.once("end", ()=>{
                //     msg.reactions.removeAll();
                // });

                // await collector.on("collect", async(reaction)=>{
                //     if(reaction.emoji.name==="✅"){
                //         const embed2=msg.embeds[0];
                //         embed2.setTitle(Localisation.getTranslation("generic.accepted"));
                //         msg.edit({embeds: [embed2]});
                //         const Suggestions=BotUser.getDatabase(DatabaseType.Suggestions);
                //         let hex=genRanHex(16);
                //         let suggestions=await Suggestions.get(hex);
                //         while(suggestions){
                //             hex=genRanHex(16);
                //             suggestions=await Suggestions.get(hex);
                //         }
                //         const suggestion=new SuggestionStruct();

                //         suggestion.userId=user.id;
                //         suggestion.request=request;
                //         suggestion.state=SuggestionState.Non;

                //         await Suggestions.set(hex, suggestion);
                //     }else if(reaction.emoji.name==='❌'){
                //         const embed2=msg.embeds[0];
                //         embed2.setTitle(Localisation.getTranslation("generic.rejected"));
                //         msg.edit({embeds: [embed2]});
                //     }
                // });
            });
        });
    }
}

export=SuggestionCommand;