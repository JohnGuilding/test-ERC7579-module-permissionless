// Based on https://docs.pimlico.io/permissionless/how-to/accounts/use-kernel-account

import { createSmartAccountClient } from "permissionless";
import { createPublicClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import { owner } from "./owner";

const main = async () => {
  const publicClient = createPublicClient({
    transport: http("https://rpc.ankr.com/eth_sepolia"),
    chain: sepolia, // added due to error message "TypeError: Cannot read properties of undefined (reading 'id')"
  });

  const apiKey = process.env.PIMLICO_API_KEY;
  const paymasterClient = createPimlicoClient({
    transport: http(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    chain: sepolia, // added due to error message "TypeError: Cannot read properties of undefined (reading 'id')"
  });

  const kernelAccount = await toEcdsaKernelSmartAccount({
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    owners: [owner],
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: sepolia,
    paymaster: paymasterClient,
    bundlerTransport: http(
      `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
    ),
    userOperation: {
      estimateFeesPerGas: async () =>
        (await paymasterClient.getUserOperationGasPrice()).fast,
    },
  });

  const txHash = await smartAccountClient.sendTransaction({
    to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    value: parseEther("0.1"),
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
