const Command=require("../../Command");
const Discord=require("discord.js");
const Utils=require("../../Utils");

class Suggestion extends Command{
    constructor(){
        super("suggestion");
        this.args=true;
        this.usage="<suggestion>";
        this.description="Suggest a feature for the bot!";
        this.aliases=["suggest"];
    }

    async onRun(bot, message, args){
        const promises = [
            bot.shard.broadcastEval(`this.channels.fetch('${process.env.SUGGESTION_CHANNEL}').catch(console.error);`),
        ];
    
        Promise.all(promises).then(async(results)=>{
            const channeld=results[0].reduce((acc,curr)=>{if(curr!==undefined) acc=curr;});
            const channel=new Discord.TextChannel(new Discord.Guild(bot, {id:channeld["guild"]}), {id:channeld["id"]});
            const botMember=await Utils.getMemberById(bot.user.id, message.channel.guild);
            const user=message.author;
            const request=args.join(" ");
            const text=`**Request by ${user}**\n${request}`;
            const embed=new Discord.MessageEmbed()
            .setDescription(text)
            .setTimestamp()
            .setFooter(user.tag, user.displayAvatarURL());
            if(botMember.roles&&botMember.roles.color)
            embed.setColor(botMember.roles.color.color);
            message.channel.send("Suggestion sent!");
            channel.send(embed).then(async(msg)=>{
                msg.react('✅');
                msg.react('❌');
                const collector=msg.createReactionCollector((reaction, user)=>(['✅', "❌"].includes(reaction.emoji.name) && user.id===process.env.OWNER_ID), {max: 1});
    
                collector.once("end", ()=>{
                    msg.reactions.removeAll();
                });
    
                
    
                await collector.on("collect", async(reaction)=>{
                    if(reaction.emoji.name==="✅"){
                        const embed2=msg.embeds[0];
                        embed2.setTitle("Accepted");
                        msg.edit(embed2);
                        const Suggestions=bot.tables["suggestions"];
                        let hex=Utils.genRanHex(16);
                        let suggestions=await Suggestions.get(hex);
                        while(suggestions){
                            hex=Utils.genRanHex(16);
                            suggestions=await Suggestions.get(hex);
                        }
                        const data={"requestor":user.id, "request":request, "state":"non"};
                        await Suggestions.set(hex, data);
                    }else if(reaction.emoji.name==='❌'){
                        const embed2=msg.embeds[0];
                        embed2.setTitle("Rejected");
                        msg.edit(embed2);
                    }
                });
    
            });
        });
    }
}

module.exports=Suggestion;