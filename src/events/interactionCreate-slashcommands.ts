import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";

export=()=>{
    BotUser.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        interaction.reply(Localisation.getTranslation("error.slashcommand"));
    });
}