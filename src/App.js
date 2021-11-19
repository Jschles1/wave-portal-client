/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import { Flex, Textarea, Text, Box } from '@chakra-ui/react';
import './App.css';
import abi from './utils/WavePortal.json';
import Button from './components/Button';

const contractAddress = '0xa0d51d2522EdE93EC56c42C3bc152a2f43460F7b';
const contractABI = abi.abi;

const App = () => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [network, setNetwork] = useState('');
    const [contract, setContract] = useState('');
    const [contractBalance, setContractBalance] = useState('');
    const [allWaves, setAllWaves] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [lotteryResultMessage, setLotteryResultMessage] = useState('');
    const { register, handleSubmit } = useForm();

    const isRinkeby = network === 'rinkeby';

    const getWeb3Provider = () => {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum, 'any');

        provider.on('network', (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                provider.removeAllListeners();
                window.location.reload();
            } else {
                setNetwork(newNetwork.name);
            }
        });

        ethereum.on('accountsChanged', async () => {
            const accounts = await provider.listAccounts();
            setCurrentAccount(accounts[0] ? accounts[0] : '');
            checkIsOwner();
        });

        return provider;
    };

    const getWavePortalContract = () => {
        const provider = getWeb3Provider();
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        return wavePortalContract;
    };

    const getContractBalance = async () => {
        const provider = getWeb3Provider();
        const balance = await provider.getBalance(contractAddress);
        const formattedBalance = ethers.utils.formatEther(balance.toNumber());
        setContractBalance(formattedBalance);
    };

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            if (ethereum && contract) {
                const waves = await contract.getAllWaves();

                let wavesCleaned = [];
                waves.forEach((wave) => {
                    wavesCleaned.push({
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                    });
                });

                setAllWaves(wavesCleaned);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIsOwner = async () => {
        if (contract) {
            const owner = await contract.owner();
            if (currentAccount.toUpperCase() === owner.toUpperCase()) {
                setIsOwner(true);
            }
        } else {
            setIsOwner(false);
        }
    };

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log('Make sure you have metamask!');
                return;
            } else {
                console.log('We have the ethereum object', ethereum);
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log('Found an authorized account:', account);
                setCurrentAccount(account);
                if (!contract) {
                    setContract(getWavePortalContract());
                }
            } else {
                console.log('No authorized account found');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert('Get MetaMask!');
                return;
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            console.log('Connected', accounts[0]);
            setCurrentAccount(accounts[0]);
            if (!contract) {
                setContract(getWavePortalContract());
            }
        } catch (error) {
            console.log(error);
        }
    };

    const wave = async (data) => {
        const { message } = data;
        if (message) {
            try {
                const { ethereum } = window;

                if (ethereum) {
                    let count = await contract.getTotalWaves();
                    console.log('Retrieved total wave count...', count.toNumber());

                    setLoadingMessage('Mining Transaction...');

                    const waveTxn = await contract.initializeWave(message);
                    console.log('Mining Wave Init...', waveTxn.hash);

                    await waveTxn.wait();
                    console.log('Wave Init Mined -- ', waveTxn.hash);
                } else {
                    console.log("Ethereum object doesn't exist!");
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const deleteWaves = async () => {
        await contract.resetWaves();
        setAllWaves([]);
    };

    const showLotteryResult = (isWiiner) => {
        if (isWiiner) {
            setLotteryResultMessage('Congrats! You Won!');
        } else {
            setLotteryResultMessage('Sorry, you lost.');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        getContractBalance();
    }, []);

    useEffect(() => {
        if (contract) {
            getAllWaves();
            checkIsOwner();

            contract.on('NewWave', (_address, _timestamp, _message, isWinner) => {
                setLoadingMessage('');
                getAllWaves();

                showLotteryResult(isWinner);
            });

            contract.on('RandomNumberRequested', () => setLoadingMessage('Generating Lottery Result...'));
        }
    }, [contract]);

    const disableWaveButton = !isRinkeby || !!loadingMessage || !contractBalance;

    const renderOwnerContent = () => (
        <>
            <Box className="header">
                <Text as="span" role="img" aria-label="wave">
                    👋
                </Text>{' '}
                Welcome back John!
            </Box>
            <Button className="deleteButton" onClick={deleteWaves} disabled={!isRinkeby || !!loadingMessage}>
                Delete Waves
            </Button>
        </>
    );

    const renderUserContent = () => (
        <>
            <Box className="header">
                <Text as="span" role="img" aria-label="wave">
                    👋
                </Text>{' '}
                Hey there!
            </Box>

            <Text className="bio">
                I'm John. Connect your Ethereum wallet and wave at me!
                <br />
                Every wave gives you a chance to win ETH!
            </Text>
        </>
    );

    const renderLotteryContent = () => (
        <Box className="lottery">
            <Text>Lottery Jackpot:</Text>
            <Text fontSize="2xl">{contractBalance} ETH</Text>
        </Box>
    );

    const renderConnectedContent = () => (
        <>
            <Textarea {...register('message')} name="message" />
            <Button className="waveButton" onClick={handleSubmit(wave)} disabled={disableWaveButton}>
                {loadingMessage ? loadingMessage : 'Wave at Me'}
            </Button>

            {lotteryResultMessage ? (
                <Text className={lotteryResultMessage.includes('Won') ? 'winner' : 'loser'}>
                    {lotteryResultMessage}
                </Text>
            ) : null}

            {isRinkeby ? (
                allWaves.map((wave, index) => {
                    return (
                        <Box key={index} mt="18px" p="16px" bgColor="main.200" borderRadius="lg">
                            <Text>Address: {wave.address}</Text>
                            <Text>Time: {wave.timestamp.toString()}</Text>
                            <Text>Message: {wave.message}</Text>
                        </Box>
                    );
                })
            ) : (
                <Text style={{ textAlign: 'center', color: 'red', lineHeight: '30px' }}>
                    You must be connected to the Rinkeby network to use this application.
                    <br /> Please switch to the Rinkeby network.
                </Text>
            )}
        </>
    );

    return (
        <Flex justifyContent="center" width="100%" mt="64px">
            <Flex direction="column" justifyContent="center" maxW="600px">
                {isOwner ? renderOwnerContent() : renderUserContent()}

                {contractBalance !== '' ? renderLotteryContent() : null}

                {!!currentAccount ? (
                    renderConnectedContent()
                ) : (
                    <Button className="waveButton" onClick={connectWallet}>
                        Connect Wallet
                    </Button>
                )}
            </Flex>
        </Flex>
    );
};

export default App;