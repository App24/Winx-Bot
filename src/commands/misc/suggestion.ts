import { TextChannel, MessageEmbed, MessageActionRow, MessageButton, BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { SUGGESTION_CHANNEL, OWNER_ID } from "../../Constants";
import { getBotRoleColor, getGuildById, GetTextBasedGuildGuildChannelById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionStruct, SuggestionState } from "../../structs/databaseTypes/SuggestionStruct";
import { genRanHex, isDM } from "../../utils/Utils";

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
            if(!isDM(cmdArgs.channel)&&channeld["guild"]===cmdArgs.guildId){
                channel=await GetTextBasedGuildGuildChannelById(SUGGESTION_CHANNEL, cmdArgs.guild);
            }else{
                channel=new TextChannel(await getGuildById(channeld["guild"]), channeld);
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
                    new MessageButton({customId: "accept", style: "SUCCESS", label: Localisation.getTranslation("button.accept")}),
                    new MessageButton({customId: "deny", style: "DANGER", label: Localisation.getTranslation("button.deny")})
                );

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
                });
            });
        });
    }
}

export=SuggestionCommand;