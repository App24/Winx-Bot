const Command=require("../../Command");
const Utils=require("../../Utils");

class CheckBans extends Command{
    constructor(){
        super("checkbans");
        this.modOnly=true;
        this.category=Command.RankCategory;
        this.description="Check bans";
    }

    async onRun(bot, message, args){
        const bans=await message.guild.fetchBans();
        var bansList=[];
        const Levels=bot.tables["levels"];
        const levels=await Levels.get(message.guild.id);
        if(!levels) return message.channel.send("There are no levels in this server");
        bans.forEach(element => {
            bansList.push(element);
        });
        await Utils.asyncForEach(bansList, async(ban)=>{
            const level=await levels.find((user)=>user.id==ban.user.id);
            if(level)
                delete levels[level];
        });
        await Levels.set(message.guild.id, levels);
        message.channel.send("Deleted all banned users from the levels!");
    }
}

module.exports=CheckBans;