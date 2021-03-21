import Canvas from 'canvas';
import Discord from 'discord.js';
import Command from '../../Command';
import { BAR_END_HEX, BAR_START_HEX } from '../../Constants';
import * as Utils from '../../Utils';

class BarColor extends Command{
    constructor(){
        super();
        this.paid=true;
        this.maxArgsLength=2;
        this.description="Set the bar color of your card!";
        this.usage="[start/end/hex] [hex]";
        this.category=Command.CustomisationCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const UserSettings=bot.getDatabase("userSettings");
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
            await this.showColor(message, barColor["startColor"]);
            await message.channel.send("End");
            await this.showColor(message, barColor["endColor"]);
            return;
        }
        let barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
        if(!barColor){
            await userSettings["settings"].push({"id": "barColor", "startColor": BAR_START_HEX, "endColor": BAR_END_HEX});
            barColor=await userSettings["settings"].find(setting=>setting["id"]==="barColor");
        }
        let startHex=barColor["startColor"], endHex=barColor["endColor"];
        if(args[0].toLowerCase()==="start"){
            if(!args[1]){
                await this.showColor(message, barColor["startColor"]);
                return;
            }
            if(args[1].toLowerCase()==="reset"){
                startHex=BAR_START_HEX;
            }else{
                let hex=args[1];
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return message.reply("That is not a valid color!");
                }
                startHex=hex;
                this.showColor(message, hex);
            }
        }else if(args[0].toLowerCase()==="end"){
            if(!args[1]){
                await this.showColor(message, barColor["endColor"]);
                return;
            }
            if(args[1].toLowerCase()==="reset"){
                endHex=BAR_END_HEX;
            }else{
                let hex=args[1];
                if(hex.startsWith("#")){
                    hex=hex.substring(1);
                }
                if(hex.length!==6){
                    return message.reply("That is not a valid color!");
                }
                endHex=hex;
                this.showColor(message, hex);
            }
        }else{
            if(args[0].toLowerCase()==="reset"){
                startHex=BAR_START_HEX;
                endHex=BAR_END_HEX;
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
                this.showColor(message, hex);
            }
        }
        barColor["startColor"]=startHex;
        barColor["endColor"]=endHex;
        message.channel.send("Settings Updated!");
        await UserSettings.set(message.guild.id, serverUserSettings);
    }

    private async showColor(message, color){
        const canvas = Canvas.createCanvas(700, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle="#"+color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
        await message.channel.send(`#${color}`, attachment);
    }

}

module.exports=BarColor;