const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");
const Canvas=require("canvas");

class CardColor extends Command{
    constructor(){
        super("cardcolor");
        this.paid=true;
        this.description="Set the background color of your card!";
        this.category=Command.CustomisationCategory;
        this.usage="[hex/reset]";
    }

    async onRun(bot, message, args){
        const UserSettings=bot.tables["userSettings"];
        const serverUserSettings=await Utils.getServerDatabase(UserSettings, message.guild.id);
        let userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        if(!userSettings){
            await serverUserSettings.push({"id": message.author.id, "settings":[]});
            userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        }
        if(args.length<=0){
            let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
            if(!cardColor){
                return message.channel.send(`You not have a custom background color!`);
            }
            this._showColor(message, cardColor["color"]);
            return;
        }
        let cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
        if(!cardColor){
            await userSettings["settings"].push({"id": "cardColor", "color": "363636"});
            cardColor=await userSettings["settings"].find(setting=>setting["id"]==="cardColor");
        }
        if(args[0].toLowerCase()==="reset"){
            cardColor["color"]="363636";
            await UserSettings.set(message.guild.id, serverUserSettings);
            return message.channel.send(`Resetted color to default: #${cardColor["color"]}`);
        }else{
            let hex=args[0];
            if(hex.startsWith("#")){
                hex=hex.substring(1);
            }
            if(hex.length!==6){
                return message.reply("That is not a valid color!");
            }
            cardColor["color"]=hex;
            message.channel.send("Settings Updated!");
            this._showColor(message, cardColor["color"]);
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
    }

    _showColor(message, color){
        const canvas = Canvas.createCanvas(700, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle="#"+color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
        message.channel.send(`#${color}`, attachment);
    }
}

module.exports=CardColor;