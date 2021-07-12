import { BotUser } from "./BotClient";

(<any>BotUser).ws.on("INTERACTION_CREATE", async(interaction)=>{
    await (<any>BotUser).api.interactions(interaction.id, interaction.token).callback.post({
        data:{
            type: 5
        }
    });

    (<any>BotUser).api.webhooks(BotUser.user.id, interaction.token).messages("@original").patch({
        data:{
            content: "These have been disabled for the time being!"
        }
    });
});

BotUser.login(process.env.TOKEN);