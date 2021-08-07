import { BotUser } from "../BotClient"

export=()=>{
    BotUser.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        interaction.reply("Currently disabled!");
    })
}