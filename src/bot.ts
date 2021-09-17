import { BotUser } from "./BotClient";
import { reportError } from "./utils/Utils";

BotUser.login(process.env.TOKEN);
BotUser.on("error", (error)=>reportError(error));