import dotenv from "dotenv";

dotenv.config();

import { BotUser } from "./BotClient";

BotUser.login(process.env.TOKEN);