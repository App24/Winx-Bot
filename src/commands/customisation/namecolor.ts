import Canvas from 'canvas';
import Discord from 'discord.js';
import { Custom } from '../../Category';
import Command from '../../Command';
import { CARD_NAME_DEFAULT } from '../../Constants';
import DatabaseType from '../../DatabaseTypes';
import * as Utils from '../../Utils';

class NameColor extends Command{
    public constructor(){
        super();
        this.paid=true;
        this.maxArgsLength=1;
        this.description="Set the name color of your card!";
        this.category=Custom;
        this.usage="[hex/reset]";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const UserSettings=bot.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings=await Utils.getServerDatabase(UserSettings, message.guild.id);
        let userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        if(!userSettings){
            await serverUserSettings.push({"id": message.author.id, "settings":[]});
            userSettings=await serverUserSettings.find(settings=>settings["id"]===message.author.id);
        }
        if(args.length<=0){
            let cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
            if(!cardNameColor||cardNameColor["color"]===CARD_NAME_DEFAULT){
                return message.channel.send(`You not have a custom name color!`);
            }
            this.showColor(message, cardNameColor["color"]);
            return;
        }
        let cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
        if(!cardNameColor){
            await userSettings["settings"].push({"id": "cardNameColor", "color": CARD_NAME_DEFAULT});
            cardNameColor=await userSettings["settings"].find(setting=>setting["id"]==="cardNameColor");
        }
        if(args[0].toLowerCase()==="reset"){
            cardNameColor["color"]=CARD_NAME_DEFAULT;
            await UserSettings.set(message.guild.id, serverUserSettings);
            return message.channel.send(`Resetted color to default`);
        }else{
            let hex=args[0];
            if(hex.startsWith("#")){
                hex=hex.substring(1);
            }
            if(hex.length!==6){
                return message.reply("That is not a valid color!");
            }
            cardNameColor["color"]=hex;
            message.channel.send("Settings Updated!");
            this.showColor(message, cardNameColor["color"]);
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
    }

    private showColor(message, color){
        const canvas = Canvas.createCanvas(700, 320);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle="#"+color;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png');
        message.channel.send(`#${color}`, attachment);
    }
}

module.exports=NameColor;