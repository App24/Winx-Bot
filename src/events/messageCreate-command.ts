import { parse } from "discord-command-parser";
import { BotUser } from "../BotClient";
import { PREFIX } from "../Constants";
import { MessageCommandArguments } from "../structs/CommandTypes";

export = () => {
    BotUser.on("messageCreate", async (message) => {
        if(message.author.bot) return;
        if(!message.content.toLowerCase().startsWith(PREFIX)) return;

        const parsed = parse(message, PREFIX, { allowSpaceBeforeCommand: true, ignorePrefixCase: true });
        if (!parsed.success) return;
        const commandName = parsed.command.toLowerCase();
        const args = parsed.arguments;

        const cmdArgs = new MessageCommandArguments(message, args);
    });
};