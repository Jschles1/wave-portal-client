/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEthers, useContractFunction, useContractCall } from '@usedapp/core';
import { ethers, utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { Flex, Textarea, Text, Box } from '@chakra-ui/react';
import './App.css';
import abi from './utils/WavePortal.json';
import Button from './components/Button';

const contractAddress = '0xE1cfbFC60Ce1785EBBFD3127F5762604e1d990F6';
// const contractABI = abi.abi;

// const contract = new Contract(contractAddress, contractABI);

const App = () => {
    const contractABI = new utils.Interface(abi.abi);
    const contract = new Contract(contractAddress, contractABI);
    const { activateBrowserWallet, account, chainId } = useEthers();
    const { state: waveTransactionState, send: sendWave, events } = useContractFunction(contract, 'initializeWave');
    const { state, send, events: finishEvents } = useContractFunction(contract, 'finishWave');
    const {
        state: fulfillState,
        send: fulfillSend,
        events: fulfillEvents,
    } = useContractFunction(contract, 'fulfillRandomness');
    const allWaves = useContractCall({ abi: contractABI, address: contractAddress, method: 'getAllWaves' });
    const formattedAllWaves =
        allWaves && allWaves.length
            ? allWaves[0].map((wave) => ({
                  message: wave.message,
                  address: wave.waver,
                  timestamp: wave.timestamp,
              }))
            : [];

    console.log('init wave state', waveTransactionState);
    console.log('finish wave state', state);
    console.log('f state', fulfillState);

    console.log('events', events);
    console.log('finishEvents', finishEvents);

    const [contractBalance, setContractBalance] = useState('');
    // const [allWaves, setAllWaves] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [lotteryResultMessage, setLotteryResultMessage] = useState('');
    const { register, handleSubmit } = useForm();

    const isRinkeby = chainId === 4;

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

                // setAllWaves(wavesCleaned);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIsOwner = async () => {
        if (contract) {
            const owner = await contract.owner();
            if (account.toUpperCase() === owner.toUpperCase()) {
                setIsOwner(true);
            }
        } else {
            setIsOwner(false);
        }
    };

    // const checkIfWalletIsConnected = async () => {
    //     try {
    //         const { ethereum } = window;

    //         if (!ethereum) {
    //             console.log('Make sure you have metamask!');
    //             return;
    //         } else {
    //             console.log('We have the ethereum object', ethereum);
    //         }

    //         const accounts = await ethereum.request({ method: 'eth_accounts' });

    //         if (accounts.length !== 0) {
    //             const account = accounts[0];
    //             console.log('Found an authorized account:', account);
    //             setCurrentAccount(account);
    //             if (!contract) {
    //                 setContract(getWavePortalContract());
    //             }
    //         } else {
    //             console.log('No authorized account found');
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    // const connectWallet = async () => {
    //     try {
    //         const { ethereum } = window;

    //         if (!ethereum) {
    //             alert('Get MetaMask!');
    //             return;
    //         }

    //         const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    //         console.log('Connected', accounts[0]);
    //         setCurrentAccount(accounts[0]);
    //         if (!contract) {
    //             setContract(getWavePortalContract());
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    const wave = async (data) => {
        const { message } = data;
        if (message) {
            try {
                const { ethereum } = window;

                if (ethereum) {
                    // let count = await contract.getTotalWaves();
                    // console.log('Retrieved total wave count...', count.toNumber());

                    // setLoadingMessage('Mining Transaction...');

                    // const waveTxn = await contract.initializeWave(message);
                    // console.log('Mining Wave Init...', waveTxn.hash);

                    // await waveTxn.wait();
                    // console.log('Wave Init Mined -- ', waveTxn.hash);
                    const waveTxn = await sendWave(message);
                    console.log('wave', waveTxn);
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
        // setAllWaves([]);
    };

    const showLotteryResult = (isWiiner) => {
        if (isWiiner) {
            setLotteryResultMessage('Congrats! You Won!');
        } else {
            setLotteryResultMessage('Sorry, you lost.');
        }
    };

    useEffect(() => {
        // checkIfWalletIsConnected();
        // getContractBalance();
    }, []);

    useEffect(() => {
        if (contract) {
            // getAllWaves();
            // checkIsOwner();
            // contract.on('NewWave', (_address, _timestamp, _message, isWinner) => {
            //     setLoadingMessage('');
            //     getAllWaves();
            //     showLotteryResult(isWinner);
            // });
            // contract.on('RandomNumberRequested', () => setLoadingMessage('Generating Lottery Result...'));
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
                formattedAllWaves.map((wave, index) => {
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

                {!!account ? (
                    renderConnectedContent()
                ) : (
                    <Button className="waveButton" onClick={activateBrowserWallet}>
                        Connect Wallet
                    </Button>
                )}
            </Flex>
        </Flex>
    );
};

export default App;
