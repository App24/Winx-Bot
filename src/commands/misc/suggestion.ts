import { Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { OWNER_ID, SUGGESTION_CHANNEL } from "../../Constants";
import { Localisation } from "../../localisation";
import { Command, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SuggestionState, SuggestionStruct } from "../../structs/databaseTypes/SuggestionStruct";
import { genRanHex, getBotRoleColor } from "../../Utils";

class SuggestionCommand extends Command{
    public constructor(){
        super();
        this.minArgs=1;
        this.usage=[new CommandUsage(true, "argument.suggestion")];
        this.aliases=["suggest"];
    }

    public async onRun(message : Message, args : string[]){
        const promises = [
            BotUser.shard.broadcastEval(`this.channels.fetch('${SUGGESTION_CHANNEL}').catch(console.error);`),
        ];

        Promise.all(promises).then(async(results)=>{
            const channeld=results[0].reduce((acc,curr)=>{if(curr!==undefined) acc=curr;});
            const channel=new TextChannel(new Guild(BotUser, {id:channeld["guild"]}), {id:channeld["id"]});
            const user=message.author;
            const request=args.join(" ");
            const text=Localisation.getTranslation("suggestion.request", user, request);
            const embed=new MessageEmbed();
            embed.setDescription(text);
            embed.setTimestamp();
            embed.setFooter(user.tag, user.displayAvatarURL());
            embed.setColor((await getBotRoleColor(message.guild)));
            message.channel.send(Localisation.getTranslation("generic.sent"));
            channel.send(embed).then(async(msg)=>{
                msg.react('✅');
                msg.react('❌');
                const collector=msg.createReactionCollector((reaction, _user)=>(['✅', "❌"].includes(reaction.emoji.name) && _user.id===OWNER_ID), {max: 1});
    
                collector.once("end", ()=>{
                    msg.reactions.removeAll();
                });

                await collector.on("collect", async(reaction)=>{
                    if(reaction.emoji.name==="✅"){
                        const embed2=msg.embeds[0];
                        embed2.setTitle(Localisation.getTranslation("generic.accepted"));
                        msg.edit(embed2);
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
                    }else if(reaction.emoji.name==='❌'){
                        const embed2=msg.embeds[0];
                        embed2.setTitle(Localisation.getTranslation("generic.rejected"));
                        msg.edit(embed2);
                    }
                });
            });
        });
    }
}

export=SuggestionCommand;