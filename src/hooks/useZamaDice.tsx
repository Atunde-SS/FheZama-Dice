"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FhevmDecryptionSignature,
  type FhevmInstance,
  type GenericStringStorage,
} from "../../fhevm-react";

import { ZamaDiceAddresses } from "@/abi/ZamaDiceAddresses";
import { ZamaDiceABI } from "@/abi/ZamaDiceABI";

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean | number;
};

type ZamaDiceInfoType = {
  abi: typeof ZamaDiceABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getZamaDiceByChainId(
  chainId: number | undefined
): ZamaDiceInfoType {
  if (!chainId) {
    return { abi: ZamaDiceABI.abi };
  }

  const entry =
    ZamaDiceAddresses[chainId.toString() as keyof typeof ZamaDiceAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: ZamaDiceABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: ZamaDiceABI.abi,
  };
}

export const useZamaDice = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  // States
  const [balanceHandle, setBalanceHandle] = useState<string | undefined>(undefined);
  const [positionHandle, setPositionHandle] = useState<string | undefined>(undefined);
  const [clearBalance, setClearBalance] = useState<ClearValueType | undefined>(undefined);
  const [clearPosition, setClearPosition] = useState<ClearValueType | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Refs
  const zamaDiceRef = useRef<ZamaDiceInfoType | undefined>(undefined);
  const clearBalanceRef = useRef<ClearValueType>(undefined);
  const clearPositionRef = useRef<ClearValueType>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);

  // Contract info
  const zamaDice = useMemo(() => {
    const c = getZamaDiceByChainId(chainId);
    zamaDiceRef.current = c;

    if (!c.address) {
      setMessage(`ZamaDice deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!zamaDice) {
      return undefined;
    }
    return (
      Boolean(zamaDice.address) && zamaDice.address !== ethers.ZeroAddress
    );
  }, [zamaDice]);

  // Refresh player data with timeout optimization
  const refreshPlayerData = useCallback(() => {
    console.log("[useZamaDice] call refreshPlayerData()");
    if (isRefreshingRef.current || !ethersSigner?.address) {
      console.log("[useZamaDice] Skip refresh - already refreshing or no signer");
      return;
    }

    if (
      !zamaDiceRef.current ||
      !zamaDiceRef.current?.chainId ||
      !zamaDiceRef.current?.address ||
      !ethersReadonlyProvider
    ) {
      console.log("[useZamaDice] Skip refresh - contract not deployed");
      setBalanceHandle(undefined);
      setPositionHandle(undefined);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = zamaDiceRef.current.chainId;
    const thisZamaDiceAddress = zamaDiceRef.current.address;
    const playerAddress = ethersSigner.address;

    const thisZamaDiceContract = new ethers.Contract(
      thisZamaDiceAddress,
      zamaDiceRef.current.abi,
      ethersReadonlyProvider
    );

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    Promise.race([
      Promise.all([
        thisZamaDiceContract.getPlayerBalance(playerAddress),
        thisZamaDiceContract.getPlayerPosition(playerAddress)
      ]),
      timeoutPromise
    ])
      .then((results) => {
        const [balance, position] = results as [string, string];
        console.log("[useZamaDice] getPlayerBalance()=" + balance);
        console.log("[useZamaDice] getPlayerPosition()=" + position);
        
        if (
          sameChain.current(thisChainId) &&
          thisZamaDiceAddress === zamaDiceRef.current?.address
        ) {
          // Always update on refresh to ensure we get latest values
          setBalanceHandle(balance);
          if (balance !== balanceHandle) {
            console.log('[useZamaDice] New balance detected, clearing decrypted value');
            setClearBalance(undefined);
            clearBalanceRef.current = undefined;
          }
          setPositionHandle(prev => prev === position ? prev : position);
        }

        isRefreshingRef.current = false;
        setIsRefreshing(false);
      })
      .catch((e) => {
        console.error("[useZamaDice] Fetch error:", e);
        setMessage("ZamaDice player data fetch failed! error=" + e);
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner?.address, sameChain]);

    // Auto refresh player data
  useEffect(() => {
    refreshPlayerData();
  }, [refreshPlayerData]);  // Decryption capabilities
  const canDecryptBalance = useMemo(() => {
    return (
      zamaDice.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      balanceHandle &&
      balanceHandle !== ethers.ZeroHash &&
      balanceHandle !== clearBalance?.handle
    );
  }, [
    zamaDice.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    balanceHandle,
    clearBalance,
  ]);

  const canDecryptPosition = useMemo(() => {
    return (
      zamaDice.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      positionHandle &&
      positionHandle !== ethers.ZeroHash &&
      positionHandle !== clearPosition?.handle
    );
  }, [
    zamaDice.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    positionHandle,
    clearPosition,
  ]);

  // Decrypt balance
  const decryptBalance = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!zamaDice.address || !instance || !ethersSigner || !balanceHandle) {
      return;
    }

    // Already computed
    if (balanceHandle === clearBalanceRef.current?.handle) {
      return;
    }

    if (balanceHandle === ethers.ZeroHash) {
      setClearBalance({ handle: balanceHandle, clear: BigInt(0) });
      clearBalanceRef.current = { handle: balanceHandle, clear: BigInt(0) };
      return;
    }

    const thisChainId = chainId;
    const thisZamaDiceAddress = zamaDice.address;
    const thisBalanceHandle = balanceHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt balance");

    const run = async () => {
      const isStale = () =>
        thisZamaDiceAddress !== zamaDiceRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [zamaDice.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM balance decryption");
          return;
        }

        setMessage("Call FHEVM userDecrypt for balance...");

          const res = await instance.userDecrypt(
          [{ handle: thisBalanceHandle, contractAddress: thisZamaDiceAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM balance userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM balance decryption");
          return;
        }

        // Get the raw decrypted value
        const rawValue = res[thisBalanceHandle];
        console.log("[useZamaDice] Raw decrypted balance:", rawValue);

        // Convert the decrypted value (it's stored as ZAMA tokens)
        const balanceValue = BigInt(rawValue);
        console.log("[useZamaDice] Parsed balance value:", balanceValue.toString());

        // Set the decrypted balance
        setClearBalance({ handle: thisBalanceHandle, clear: balanceValue });
        clearBalanceRef.current = {
          handle: thisBalanceHandle,
          clear: balanceValue
        };        setMessage("Balance clear value is " + clearBalanceRef.current.clear);
      } catch (error) {
        setMessage("Balance decryption failed: " + error);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    zamaDice.address,
    instance,
    balanceHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  // Auto decrypt new balance
  useEffect(() => {
    if (balanceHandle && (!clearBalance || clearBalance.handle !== balanceHandle) && !isDecrypting && !isRefreshing) {
      console.log('[useZamaDice] Auto-decrypting new balance');
      decryptBalance();
    }
  }, [balanceHandle, clearBalance, isDecrypting, isRefreshing, decryptBalance]);

  // Decrypt position
  const decryptPosition = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!zamaDice.address || !instance || !ethersSigner || !positionHandle) {
      return;
    }

    // Already computed
    if (positionHandle === clearPositionRef.current?.handle) {
      return;
    }

    if (positionHandle === ethers.ZeroHash) {
      setClearPosition({ handle: positionHandle, clear: 0 });
      clearPositionRef.current = { handle: positionHandle, clear: 0 };
      return;
    }

    const thisChainId = chainId;
    const thisZamaDiceAddress = zamaDice.address;
    const thisPositionHandle = positionHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypt position");

    const run = async () => {
      const isStale = () =>
        thisZamaDiceAddress !== zamaDiceRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [zamaDice.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM position decryption");
          return;
        }

        setMessage("Call FHEVM userDecrypt for position...");

        const res = await instance.userDecrypt(
          [{ handle: thisPositionHandle, contractAddress: thisZamaDiceAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("FHEVM position userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM position decryption");
          return;
        }

        setClearPosition({ handle: thisPositionHandle, clear: res[thisPositionHandle] });
        clearPositionRef.current = {
          handle: thisPositionHandle,
          clear: res[thisPositionHandle],
        };

        setMessage("Position clear value is " + clearPositionRef.current.clear);
      } catch (error) {
        setMessage("Position decryption failed: " + error);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    zamaDice.address,
    instance,
    positionHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  // Grant permissions
  const grantPermissions = useCallback(async () => {
    if (!zamaDice.address || !ethersSigner) {
      throw new Error("Contract or signer not available");
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersSigner
    );

    const tx = await contract.grantPermissions();
    await tx.wait();
    setMessage("Permissions granted successfully");
  }, [zamaDice.address, zamaDice.abi, ethersSigner]);

  // Start game
  const startGame = useCallback(async () => {
    if (!zamaDice.address || !ethersSigner) {
      throw new Error("Contract or signer not available");
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersSigner
    );

    const tx = await contract.startGame();
    await tx.wait();
    setMessage("Game started successfully");
    refreshPlayerData();
  }, [zamaDice.address, zamaDice.abi, ethersSigner, refreshPlayerData]);

  // Roll dice
  const rollDice = useCallback(async () => {
    if (!zamaDice.address || !ethersSigner || !instance) {
      throw new Error("Contract, signer, or fhEVM instance not available");
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersSigner
    );

    const tx = await contract.rollDice();
    await tx.wait();
    setMessage("Dice rolled successfully");
    
    // Clear all caches
    clearBalanceRef.current = undefined;
    setClearBalance(undefined);
    setBalanceHandle(undefined);
    
    // Wait a bit for the chain to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh player data
    await refreshPlayerData();
  }, [zamaDice.address, zamaDice.abi, ethersSigner, instance, refreshPlayerData]);

  // Claim reward
  const claimReward = useCallback(async () => {
    if (!zamaDice.address || !ethersSigner) {
      throw new Error("Contract or signer not available");
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersSigner
    );

    const tx = await contract.claimReward();
    await tx.wait();
    setMessage("Reward claimed successfully");
    refreshPlayerData();
  }, [zamaDice.address, zamaDice.abi, ethersSigner, refreshPlayerData]);

  // Mint NFT
  const mintNFT = useCallback(async () => {
    if (!zamaDice.address || !ethersSigner) {
      throw new Error("Contract or signer not available");
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersSigner
    );

    const tx = await contract.mintNFT();
    await tx.wait();
    setMessage("NFT minted successfully");
    refreshPlayerData();
  }, [zamaDice.address, zamaDice.abi, ethersSigner, refreshPlayerData]);

  // Get player status
  const getPlayerStatus = useCallback(async () => {
    if (!zamaDice.address || !ethersReadonlyProvider || !ethersSigner?.address) {
      return null;
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersReadonlyProvider
    );

    return await contract.getPlayerStatus(ethersSigner.address);
  }, [zamaDice.address, zamaDice.abi, ethersReadonlyProvider, ethersSigner?.address]);

  // Get ETH balance
  const getEthBalance = useCallback(async () => {
    if (!ethersReadonlyProvider || !ethersSigner?.address) {
      return "0.0000";
    }

    const balance = await (ethersReadonlyProvider as any).getBalance(ethersSigner.address);
    return ethers.formatEther(balance);
  }, [ethersReadonlyProvider, ethersSigner?.address]);

  // Get NFT info
  const getNFTInfo = useCallback(async () => {
    if (!zamaDice.address || !ethersReadonlyProvider) {
      return { currentSupply: 0, maxSupply: 10000 };
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersReadonlyProvider
    );

    return await contract.getNFTInfo();
  }, [zamaDice.address, zamaDice.abi, ethersReadonlyProvider]);

  // Get tile data
  const getTile = useCallback(async (position: number) => {
    if (!zamaDice.address || !ethersReadonlyProvider) {
      return { name: `Tile ${position}`, type: "0", value: "0" };
    }

    const contract = new ethers.Contract(
      zamaDice.address,
      zamaDice.abi,
      ethersReadonlyProvider
    );

    const [tileName, tileType, value] = await contract.getTile(position);
    return { name: tileName, type: tileType.toString(), value: value.toString() };
  }, [zamaDice.address, zamaDice.abi, ethersReadonlyProvider]);

  return {
    contractAddress: zamaDice.address,
    isDeployed,
    canDecryptBalance,
    canDecryptPosition,
    decryptBalance,
    decryptPosition,
    grantPermissions,
    startGame,
    rollDice,
    claimReward,
    mintNFT,
    getPlayerStatus,
    getEthBalance,
    getNFTInfo,
    getTile,
    refreshPlayerData,
    message,
    balanceHandle,
    positionHandle,
    clearBalance: clearBalance?.clear,
    clearPosition: clearPosition?.clear,
    isDecrypting,
    isRefreshing,
    isBalanceDecrypted: balanceHandle && balanceHandle === clearBalance?.handle,
    isPositionDecrypted: positionHandle && positionHandle === clearPosition?.handle,
  };
};