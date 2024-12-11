import { privateKeyToAccount } from "viem/accounts";
import { isHex } from "viem";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || !isHex(privateKey)) {
  throw new Error("Invalid or missing PRIVATE_KEY");
}
const owner = privateKeyToAccount(privateKey);

export { owner };
