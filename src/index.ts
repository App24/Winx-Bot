import dotenv from "dotenv";
import { BotUser } from "./BotClient";

dotenv.config();

BotUser.login(process.env.TOKEN);