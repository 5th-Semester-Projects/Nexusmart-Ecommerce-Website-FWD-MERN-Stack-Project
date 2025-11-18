import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window.ethereum !== 'undefined') {
        setIsMetaMaskInstalled(true);
      } else {
        setIsMetaMaskInstalled(false);
      }
    };
    checkMetaMask();
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      toast.error('Please install MetaMask to use crypto features');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);

      // Get chain ID
      const network = await web3Provider.getNetwork();
      setChainId(Number(network.chainId));

      // Get balance
      const accountBalance = await web3Provider.getBalance(selectedAccount);
      setBalance(ethers.formatEther(accountBalance));

      toast.success(`Connected to ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    toast.success('Wallet disconnected');
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) {
      toast.error('MetaMask not found');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(targetChainId) }],
      });
      setChainId(targetChainId);
      toast.success('Network switched successfully');
    } catch (error) {
      console.error('Network switch error:', error);

      // If network doesn't exist, add it
      if (error.code === 4902) {
        toast.error('Network not found. Please add it manually in MetaMask');
      } else {
        toast.error('Failed to switch network');
      }
    }
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (to, amount) => {
    if (!signer) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
      });

      toast.loading('Transaction pending...', { id: 'tx-pending' });

      const receipt = await tx.wait();

      toast.dismiss('tx-pending');
      toast.success(`Transaction confirmed! Hash: ${receipt.hash.slice(0, 10)}...`);

      return receipt;
    } catch (error) {
      console.error('Transaction error:', error);
      toast.dismiss('tx-pending');
      toast.error('Transaction failed');
      return null;
    }
  }, [signer]);

  // Sign message
  const signMessage = useCallback(async (message) => {
    if (!signer) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const signature = await signer.signMessage(message);
      toast.success('Message signed successfully');
      return signature;
    } catch (error) {
      console.error('Sign message error:', error);
      toast.error('Failed to sign message');
      return null;
    }
  }, [signer]);

  // Get token balance (ERC-20)
  const getTokenBalance = useCallback(async (tokenAddress) => {
    if (!provider || !account) {
      return '0';
    }

    try {
      const tokenABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Get token balance error:', error);
      return '0';
    }
  }, [provider, account]);

  // Listen to account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        toast.info('Account changed');
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      toast.info('Network changed');
      // Reload to ensure proper state
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, disconnectWallet]);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          // Auto-connect without prompting
          connectWallet();
        }
      } catch (error) {
        console.error('Auto-connect error:', error);
      }
    };

    checkConnection();
  }, []);

  return {
    // State
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    isConnected: !!account,
    isMetaMaskInstalled,

    // Methods
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    signMessage,
    getTokenBalance,
  };
};

export default useWeb3;
