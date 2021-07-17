import { createCanvas, loadImage } from "canvas";
import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberByID, getRoleByID } from "../../GetterUtilts";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { UserSetting, copyUserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { getServerDatabase, getCurrentRank, getNextRank, capitalise, hexToRGB, getLevelXP, blend, canvasToMessageAttachment, isHexColor } from "../../Utils";

class MagicLevelsCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.user")];
        this.availability=CommandAvailability.Guild;
        this.category=Rank;
        this.aliases=["ml", "levels"];
    }

    public async onRun(message : Message, args : string[]){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        const levels:UserLevel[]=await getServerDatabase(Levels, message.guild.id);
        let user=message.author;
        if(args.length){
            const temp=await getUserFromMention(args[0]);
            if(!temp) return message.reply(Localisation.getTranslation("error.invalid.user"));
            user=temp;
        }
        if(user.bot) return message.reply(Localisation.getTranslation("error.bot.user", user));

        const member=await getMemberByID(user.id, message.guild);
        if(!member) return message.reply(Localisation.getTranslation("error.invalid.member"));

        let userLevel = levels.find(u=>u.userId===user.id);
        if(!userLevel){
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u=>u.userId===user.id);
        }
        let userSetting=serverUserSettings.find(u=>u.userId===user.id);
        if(!userSetting){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, user.id));
            userSetting=serverUserSettings.find(u=>u.userId===user.id);
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const currentRank=await getCurrentRank(userLevel.level, message.guild.id);
        const nextRank=await getNextRank(userLevel.level, message.guild.id);

        let currentRankText=Localisation.getTranslation("generic.none");
        if(currentRank){
            const role=await getRoleByID(currentRank.roleId, message.guild);
            if(role){
                currentRankText=capitalise(role.name);
            }else{
                currentRankText=Localisation.getTranslation("generic.unknown");
            }
        }
        currentRankText=Localisation.getTranslation("magiclevels.transformation.current", currentRankText);

        let nextRankText=Localisation.getTranslation("generic.none");
        if(nextRank){
            const role=await getRoleByID(nextRank.roleId, message.guild);
            if(role){
                nextRankText=capitalise(role.name);
            }else{
                nextRankText=Localisation.getTranslation("generic.unknown");
            }
        }
        nextRankText=Localisation.getTranslation("magiclevels.transformation.next", nextRankText);

        const canvas=createCanvas(10,10);
        const ctx=canvas.getContext("2d");

        let name=Localisation.getTranslation("magiclevels.username", user.username);
        if(member.nickname)
            name+=Localisation.getTranslation("magiclevels.nickname", member.nickname);
        let levelsText=Localisation.getTranslation("magiclevels.level", userLevel.level);
        
        const nameFontSize=70;
        const pfpRadius=nameFontSize*2;
        const pfpX=5;
        const pfpY=5;
        const borderThickness=6;
        const newpfpRadius=pfpRadius-borderThickness;

        let rgb=hexToRGB(userSetting.barStartColor);
        const startHsl=rgbToHsl(rgb.r, rgb.g, rgb.b);

        rgb=hexToRGB(userSetting.barEndColor);
        const endHsl=rgbToHsl(rgb.r, rgb.g, rgb.b);

        rgb=hexToRGB(userSetting.cardColor);
        const brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        const textColor = (brightness > 125) ? 'black' : 'white';

        const newHeight=pfpY+(pfpRadius*2)+pfpY;
        const transformationFontSize=newHeight*0.2068965517241379;

        ctx.font=`${nameFontSize}px sans-serif`;
        let extraWidth=ctx.measureText(name+levelsText).width;

        ctx.font=`${transformationFontSize}px sans-serif`;
        if(ctx.measureText(currentRankText).width>extraWidth){
            extraWidth=ctx.measureText(currentRankText).width;
        }
        if(ctx.measureText(nextRankText).width>extraWidth){
            extraWidth=ctx.measureText(nextRankText).width;
        }

        canvas.width=pfpX+(pfpRadius*2)+pfpX+extraWidth+pfpX;
        canvas.height=newHeight;

        const barHeight=canvas.height*0.15;
        const levelFont=`${barHeight}px sans-serif`;

        const textPos=nameFontSize+((canvas.height-(nameFontSize+(transformationFontSize*3.5)))/2.0);

        //Draw background
        ctx.fillStyle=`#${userSetting.cardColor}`;
        roundRect(ctx,0,0,canvas.width,canvas.height, 20).fill();

        //Draw name and level info
        ctx.font=`${nameFontSize}px sans-serif`;
        if(userSetting.nameColor===DEFAULT_USER_SETTING.nameColor||!isHexColor(userSetting.nameColor)){
            if(member.roles&&member.roles.color&&member.roles.color.color) ctx.fillStyle=member.roles.color.hexColor;
        }else{
            ctx.fillStyle=`#${userSetting.nameColor}`;
        }
        ctx.fillText(name, pfpX+(pfpRadius*2)+pfpX, textPos);
        ctx.fillStyle=textColor;
        ctx.fillText(levelsText, pfpX+(pfpRadius*2)+pfpX+ctx.measureText(name).width, textPos);

        //Draw Level bar background
        const barWidth=extraWidth;
        const filled=userLevel.xp/getLevelXP(userLevel.level);
        ctx.fillStyle="#272822";
        roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth, barHeight, 20).fill();

        //Draw Level bar
        ctx.fillStyle=`hsla(${blend(startHsl[0], endHsl[0], 1-filled)*360}, ${blend(startHsl[1], endHsl[1], 1-filled)*100}%, ${blend(startHsl[2], endHsl[2], 1 - filled)*100}%, 1)`;
        roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth*filled, barHeight, 20).fill();

        //Draw level text
        ctx.font=levelFont;
        ctx.fillStyle="#ffffff";
        ctx.textBaseline="middle";
        ctx.textAlign="center";
        ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (pfpX+(pfpRadius*2)+pfpX)+(barWidth/2.0), textPos+10+(barHeight*0.5));

        //Draw transformation info text
        ctx.font=`${transformationFontSize}px sans-serif`;
        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillStyle=textColor;
        ctx.fillText(currentRankText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight);
        ctx.fillText(nextRankText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight+transformationFontSize+5);

        drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, `#${userSetting.specialCircleColor||DEFAULT_USER_SETTING.specialCircleColor}`);

        //Draw Profile Picture
        ctx.save();
        ctx.beginPath();
        ctx.arc(newpfpRadius+pfpX+borderThickness, newpfpRadius+pfpY+borderThickness, newpfpRadius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.clip();
        
        const avatar=await loadImage(member.user.displayAvatarURL({format: 'png'}));
        ctx.drawImage(avatar, pfpX+borderThickness, pfpY+borderThickness, newpfpRadius*2, newpfpRadius*2);
        ctx.restore();

        message.channel.send(canvasToMessageAttachment(canvas, "magiclevels"));
    }
}

function drawSpecialCircle(ctx : CanvasRenderingContext2D, x : number, y : number, radius : number, color : string){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x+radius, y+radius, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle=color;
    ctx.fillRect(x,y,radius*2,radius*2);
    ctx.restore();
}

function roundRect(ctx : CanvasRenderingContext2D, x : number, y : number, width : number, height : number, radius : number){
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x+radius, y);
    ctx.arcTo(x+width, y, x+width, y+height, radius);
    ctx.arcTo(x+width, y+height, x, y+height, radius);
    ctx.arcTo(x, y+height, x, y, radius);
    ctx.arcTo(x, y, x+width, y, radius);
    ctx.closePath();
    return ctx;
}

function rgbToHsl(r : number, g : number, b : number){
    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
    h = s = 0; // achromatic
    } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
    }

    return [ h, s, l ];
}

export=MagicLevelsCommand;