import { createCanvas, loadImage } from "canvas";
import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberById, getRoleById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { getServerDatabase, hexToRGB, blend, isHexColor, canvasToMessageAttachment } from "../../utils/Utils";
import { getCurrentRank, getNextRank } from "../../utils/RankUtils";
import { capitalise } from "../../utils/FormatUtils";
import { getLevelXP } from "../../utils/XPUtils";
import { rgbToHsl, roundRect } from "../../utils/CanvasUtils";
import { CANVAS_FONT } from "../../Constants";

class LevelsCommand extends Command{
    public constructor(){
        super();
        this.maxArgs=1;
        this.usage=[new CommandUsage(false, "argument.user")];
        this.available=CommandAvailable.Guild;
        this.category=Rank;
        this.aliases=["ml", "magiclevels"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const Levels=BotUser.getDatabase(DatabaseType.Levels);
        const levels:UserLevel[]=await getServerDatabase(Levels, cmdArgs.guildId);

        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);

        levels.sort((a,b)=>{
            if(a.level===b.level){
                return b.xp-a.xp;
            }
            return b.level-a.level;
        });

        let user=cmdArgs.author;
        if(cmdArgs.args.length){
            const tempUser=await getUserFromMention(cmdArgs.args[0]);
            if(!tempUser) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            user=tempUser;
        }
        if(user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));

        const member=await getMemberById(user.id, cmdArgs.guild);
        if(!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        let userLevel = levels.find(u=>u.userId===user.id);
        if(!userLevel){
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u=>u.userId===user.id);
        }
        let userSettings=await UserSettings.get(user.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(user.id, userSettings);
        }

        const currentRank=await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank=await getNextRank(userLevel.level, cmdArgs.guildId);

        let currentRankText=Localisation.getTranslation("generic.none");
        if(currentRank){
            const role=await getRoleById(currentRank.roleId, cmdArgs.guild);
            currentRankText=role?capitalise(role.name):Localisation.getTranslation("generic.unknown");
        }
        currentRankText=Localisation.getTranslation("magiclevels.transformation.current", currentRankText);

        let nextRankText=Localisation.getTranslation("generic.none");
        if(nextRank){
            const role=await getRoleById(nextRank.roleId, cmdArgs.guild);
            nextRankText=role?capitalise(role.name):Localisation.getTranslation("generic.unknown");
        }
        nextRankText=Localisation.getTranslation("magiclevels.transformation.next", nextRankText);

        const lbPosition=Localisation.getTranslation("magiclevels.lb.position", levels.findIndex(u=>u.userId===user.id)+1);

        const canvas=createCanvas(10,10);
        const ctx=canvas.getContext("2d");

        const name=user.tag;
        const levelsText=Localisation.getTranslation("magiclevels.level", userLevel.level);
        
        const nameFontSize=80;
        const pfpRadius=nameFontSize*2;
        const pfpX=8;
        const pfpY=8;
        const borderThickness=10;
        const newpfpRadius=pfpRadius-borderThickness;

        const filled=userLevel.xp/getLevelXP(userLevel.level);

        const startRGB=hexToRGB(userSettings.barStartColor);
        const startHsl=rgbToHsl(startRGB.r, startRGB.g, startRGB.b);

        const endRGB=hexToRGB(userSettings.barEndColor);
        const endHsl=rgbToHsl(endRGB.r, endRGB.g, endRGB.b);

        let rgb=hexToRGB(userSettings.cardColor);
        let brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        const textColor = (brightness > 125) ? 'black' : 'white';

        rgb={r: blend(startRGB.r, endRGB.r, 1-filled), g: blend(startRGB.g, endRGB.g, 1-filled), b: blend(startRGB.b, endRGB.b, 1-filled)};
        brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
        const levelColor=(brightness > 125) ? "black" : "white";

        const newHeight=pfpY+(pfpRadius*2)+pfpY;
        const transformationFontSize=newHeight*(0.2068965517241379*0.75);

        ctx.font=`${nameFontSize}px ${CANVAS_FONT}`;
        let extraWidth=ctx.measureText(name+levelsText).width;

        ctx.font=`${transformationFontSize}px ${CANVAS_FONT}`;
        if(ctx.measureText(currentRankText).width>extraWidth){
            extraWidth=ctx.measureText(currentRankText).width;
        }
        if(ctx.measureText(nextRankText).width>extraWidth){
            extraWidth=ctx.measureText(nextRankText).width;
        }
        if(ctx.measureText(lbPosition).width>extraWidth){
            extraWidth=ctx.measureText(lbPosition).width;
        }

        canvas.width=pfpX+(pfpRadius*2)+pfpX+extraWidth+pfpX;
        canvas.height=newHeight;

        const barHeight=canvas.height*0.15;
        const levelFont=`${barHeight}px ${CANVAS_FONT}`;

        const extraInfoAmount=3;
        const textPos=nameFontSize+((canvas.height-(nameFontSize+(transformationFontSize*(extraInfoAmount*1.75))))/2.0);

        //Draw background
        ctx.fillStyle=`#${userSettings.cardColor}`;
        roundRect(ctx, 0, 0, canvas.width, canvas.height, canvas.width*0.01);

        //Draw name and level info
        ctx.font=`${nameFontSize}px ${CANVAS_FONT}`;
        if(userSettings.nameColor===DEFAULT_USER_SETTING.nameColor||!isHexColor(userSettings.nameColor)){
            if(member.roles&&member.roles.color&&member.roles.color.color) ctx.fillStyle=member.roles.color.hexColor;
        }else{
            ctx.fillStyle=`#${userSettings.nameColor}`;
        }
        ctx.fillText(name, pfpX+(pfpRadius*2)+pfpX, textPos);
        ctx.fillStyle=textColor;
        ctx.fillText(levelsText, pfpX+(pfpRadius*2)+pfpX+ctx.measureText(name).width, textPos);

        //Draw Level bar background
        const barWidth=extraWidth;
        ctx.fillStyle="#272822";
        roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth, barHeight, 20);

        //Draw Level bar
        ctx.fillStyle=`hsla(${blend(startHsl[0], endHsl[0], 1-filled)*360}, ${blend(startHsl[1], endHsl[1], 1-filled)*100}%, ${blend(startHsl[2], endHsl[2], 1 - filled)*100}%, 1)`;
        ctx.save();
        roundRect(ctx, pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth, barHeight, 20, "clip");
        ctx.fillRect(pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth*filled, barHeight);
        ctx.restore();

        //Draw level text
        ctx.save();
        ctx.beginPath();
        ctx.rect(pfpX+(pfpRadius*2)+pfpX, textPos+10, barWidth*filled, barHeight);
        ctx.clip();
        ctx.font=levelFont;
        ctx.fillStyle=levelColor;
        ctx.textBaseline="middle";
        ctx.textAlign="center";
        ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (pfpX+(pfpRadius*2)+pfpX)+(barWidth/2.0), textPos+10+(barHeight*0.5));
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.rect((barWidth*filled)+pfpX+(pfpRadius*2)+pfpX, textPos+10, canvas.width, barHeight);
        ctx.clip();
        ctx.font=levelFont;
        ctx.fillStyle="#ffffff";
        ctx.textBaseline="middle";
        ctx.textAlign="center";
        ctx.fillText(Localisation.getTranslation("magiclevels.levels", userLevel.xp, getLevelXP(userLevel.level)), (pfpX+(pfpRadius*2)+pfpX)+(barWidth/2.0), textPos+10+(barHeight*0.5));
        ctx.restore();

        //Draw transformation info text
        ctx.font=`${transformationFontSize}px ${CANVAS_FONT}`;
        ctx.textBaseline='top';
        ctx.textAlign="left";
        ctx.fillStyle=textColor;
        ctx.fillText(currentRankText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight);
        ctx.fillText(nextRankText, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight+transformationFontSize+5);
        ctx.fillText(lbPosition, pfpX+(pfpRadius*2)+pfpX, textPos+10+barHeight+(transformationFontSize+5)*2);

        drawSpecialCircle(ctx, pfpX, pfpY, pfpRadius, `#${userSettings.specialCircleColor||DEFAULT_USER_SETTING.specialCircleColor}`);

        //Draw Profile Picture
        ctx.save();
        ctx.beginPath();
        ctx.arc(newpfpRadius+pfpX+borderThickness, newpfpRadius+pfpY+borderThickness, newpfpRadius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.clip();
        
        const avatar=await loadImage(member.displayAvatarURL({format: 'png'}));
        ctx.drawImage(avatar, pfpX+borderThickness, pfpY+borderThickness, newpfpRadius*2, newpfpRadius*2);
        ctx.restore();

        cmdArgs.message.reply({files: [canvasToMessageAttachment(canvas, "magiclevels")]});
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

export=LevelsCommand;