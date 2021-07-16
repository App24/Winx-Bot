import { BotUser } from "./BotClient";
import { Localisation } from "./localisation";

(<any>BotUser).ws.on("INTERACTION_CREATE", async(interaction)=>{
    await (<any>BotUser).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type: 5
        }
    });

    (<any>BotUser).api.webhooks(BotUser.user.id, interaction.token).messages("@original").patch({
        data:{
            content: Localisation.getTranslation("error.slashcommand")
        }
    });
});

BotUser.login(process.env.TOKEN);