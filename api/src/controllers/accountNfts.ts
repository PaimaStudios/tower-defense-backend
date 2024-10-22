import { getOwnedNfts } from '@paima/utils-backend';
import { requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { Abi, createPublicClient, getContract, http } from 'viem';
import annotatedMintNftAbi from '@paima/evm-contracts/abi/AnnotatedMintNft.json' with { type: 'json' };

const publicClient = createPublicClient({
  // TODO: un-hardcode Hardhat here
  chain: {
    // config chainId
    id: 31_337,
    // probably the config key would work here
    name: 'Hardhat',
    nativeCurrency: {
      // config chainCurrencyDecimals
      decimals: 18,
      // config chainCurrencyName
      name: 'Ether',
      // config chainCurrencySymbol
      symbol: 'ETH',
    },
    rpcUrls: {
      // config chainUri
      default: { http: ['http://127.0.0.1:8545'] },
    },
  },
  transport: http(),
});

// TODO: un-hardcode contract address.
const contract = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';

const trainers = getContract({
  abi: annotatedMintNftAbi as unknown as Abi,
  address: contract,
  client: publicClient,
});

function ipfsToHttp(ipfs: string): string {
  // nftstorage.link because it's what we use in Tarochi
  return ipfs.replace(/^ipfs:\/\//, 'https://nftstorage.link/ipfs/');
}

interface AccountNftsResult {
  metadata: {
    name: string;
    image: string;
  };
  contract: string;
  tokenId: number;
}

interface AccountNftsData {
  pages: number;
  totalItems: number;
  result: AccountNftsResult[];
}

@Route('account-nfts')
export class AccountNftsController extends Controller {
  @Get()
  public async get(
    @Query() account: string,
    @Query() page: number,
    @Query() size: number
  ): Promise<{ response: AccountNftsData }> {
    console.log('account-nfts', account, page, size);

    const pool = requirePool();
    const tokenIds = await getOwnedNfts(pool, 'EVM Genesis Trainers', account);

    const tokenId = tokenIds[page];

    const metadataUri = (await trainers.read.tokenURI([tokenId])) as string;
    const metadata = await (await fetch(ipfsToHttp(metadataUri))).json();

    const item = {
      metadata: {
        name: metadata.name,
        image: ipfsToHttp(metadata.image),
      },
      contract,
      tokenId: Number(tokenId),
    };

    return {
      response: {
        pages: tokenIds.length,
        totalItems: tokenIds.length,
        result: [item],
      },
    };
  }
}
