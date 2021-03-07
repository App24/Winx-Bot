const Command=require("../../Command");
const Utils=require("../../Utils");

class CheckRanks extends Command{
    constructor(){
        super("checkranks");
        this.modOnly=true;
        this.description="Check ranks";
        this.category=Command.RankCategory;
    }

    async onRun(bot, message, args){
        const Levels=bot.tables["levels"];
        const Ranks=bot.tables["ranks"];
        const levels=await Levels.get(message.guild.id);
        const ranks=await Ranks.get(message.guild.id);
        if(!levels||!ranks) return message.channel.send("There are no levels or ranks on this server!");
        const members=await message.guild.members.fetch().then(async(promise)=>{return promise.array();});
        await Utils.asyncForEach(members, async(member) => {
            const user=await levels.find(u=>u["id"]===member.user.id);
            if(user){
                await Utils.asyncForEach(ranks, async(rank) => {
                    if(user["level"]>=rank["level"]){
                        const role=await Utils.getRoleByID(rank["role"], message.guild);
                        if(!role) return;
                        member.roles.add(role);
                    }
                });
            }
        });
        return message.channel.send("Done");
    }
}

module.exports=CheckRanks;