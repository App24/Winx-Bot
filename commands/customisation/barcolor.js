const Command=require("../../Command");
const Utils=require("../../Utils");
const Discord=require("discord.js");
const Canvas=require("canvas");

class BarColor extends Command{
    constructor(){
        super("barcolor");
        this.paid=true;
        this.description="Set the bar color of your card!";
        this.usage="[start/end/hex] [hex]";
        this.category=Command.CustomisationCategory;
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
            let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
            if(!barColor){
                return message.channel.send(`You do not have a custom bar color!`);
            }
            await message.channel.send("Start");
            await this._showColor(message, barColor["startColor"]);
            await message.channel.send("End");
            await this._showColor(message, barColor["endColor"]);
            return;
        }
        let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
        if(!barColor){
            await userSettings["settings"].push({"id": "barColor", "startColor": "cc0000", "endColor": "44cc00"});
            barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
        }
        let startHex=barColor["startColor"], endHex=barColor["endColor"];
        if(args[0].toLowerCase()==="start"){
            if(!args[1]){
                await this._showColor(message, barColor["startColor"]);
                return;
            }
            if(args[1].toLowerCase()==="reset"){
                startHex="cc0000";
            }else{
                let hex=args[1];
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return message.reply("That is not a valid color!");
                }
                startHex=hex;
                this._showColor(message, hex);
            }
        }else if(args[0].toLowerCase()==="end"){
            if(!args[1]){
                await this._showColor(message, barColor["endColor"]);
                return;
            }
            if(args[1].toLowerCase()==="reset"){
                endHex="44cc00";
            }else{
                let hex=args[1];
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return message.reply("That is not a valid color!");
                }
                endHex=hex;
                this._showColor(message, hex);
            }
        }else{
            if(args[0].toLowerCase()==="reset"){
                startHex="cc0000";
                endHex="44cc00";
            }else{
                let hex=args[0];
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return message.reply("That is not a valid color!");
                }
                startHex=hex;
                endHex=hex;
                this._showColor(message, hex);
            }
        }
        barColor["startColor"]=startHex;
        barColor["endColor"]=endHex;
        message.channel.send("Settings Updated!");
        await UserSettings.set(message.guild.id, serverUserSettings);
    }

    async _showColor(message, color){
        const canvas = Canvas.createCanvas(700, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle="#"+color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
        await message.channel.send(`#${color}`, attachment);
    }
}

module.exports=BarColor;