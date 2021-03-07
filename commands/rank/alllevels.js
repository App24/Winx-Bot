const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");

class AllLevels extends Command{
    constructor(){
        super("alllevels");
        this.ownerOnly=true;
        this.category=Command.OwnerCategory;
    }

    async onRun(bot, message, args){
        const Levels=bot.tables["levels"];
        const levels=await Levels.get(message.guild.id);
        if(args.length>0){
            const temp=await Utils.getUserFromMention(args[0], bot);
            if(!temp) return message.channel.send(`\`${args[0]}\` is not a valid user`);
        }
        if(!levels) return message.channel.send("There are no levels in this server");
        await levels.sort((a,b)=>{
            if(a["level"]===b["level"]){
                return (a["xp"]>b["xp"])?-1:1;
            }
            return (a["level"]>b["level"])?-1:1;
        });
        const actualLevels=[];
        await Utils.asyncForEach(levels, async(element)=>{
            const user=await Utils.getUserByID(element["id"], bot);
            if(user){
                actualLevels.push(`${user.tag}: Level: ${element["level"]} XP: ${element["xp"]}/${Utils.getLevelXP(element["level"])}`);
            }
        });
        var fs = require('fs');

        var file = fs.createWriteStream('levels.txt');
        file.on('error', function(err) { /* error handling */ });
        actualLevels.forEach(function(v) { file.write(v+'\n'); });
        file.end();
        const attachement=new Discord.MessageAttachment(fs.createReadStream("levels.txt"), "levels.txt");
        message.channel.send(attachement);
        fs.unlinkSync("levels.txt");
    }
}

module.exports=AllLevels;