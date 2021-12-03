/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Flex, Textarea, Text, Box } from '@chakra-ui/react';
import Button from './components/Button';
import Layout from './components/Layout';
import Card from './components/Card';
import { setCurrentAccount } from './store/reducers/web3Reducer';
import { getWavePortalContract, fetchContractBalance } from './utils/web3Helpers';

const App = () => {
    const dispatch = useDispatch();
    const currentAccount = useSelector((state) => state.web3.currentAccount);
    const network = useSelector((state) => state.web3.network);
    const [contractBalance, setContractBalance] = useState('');
    const [allWaves, setAllWaves] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [lotteryResultMessage, setLotteryResultMessage] = useState('');
    const { register, handleSubmit } = useForm();

    const isRinkeby = network === 'rinkeby';

    const getContractBalance = async () => {
        const formattedBalance = await fetchContractBalance(dispatch);
        setContractBalance(formattedBalance);
    };

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;
            const contract = getWavePortalContract(dispatch);
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
        const contract = getWavePortalContract(dispatch);
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
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log('Found an authorized account:', account);
                dispatch(setCurrentAccount(account));
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
            dispatch(setCurrentAccount(accounts[0]));
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
                    const contract = getWavePortalContract(dispatch);
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
                setLoadingMessage('');
                console.log(error);
            }
        }
    };

    const deleteWaves = async () => {
        const contract = getWavePortalContract(dispatch);
        await contract.resetWaves();
        setAllWaves([]);
    };

    const showLotteryResult = (isWinner) => {
        if (isWinner) {
            setLotteryResultMessage('Congrats! You Won 0.0001 ETH!');
        } else {
            setLotteryResultMessage('Sorry, you lost.');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        getContractBalance();
    }, []);

    useEffect(() => {
        if (currentAccount) {
            getAllWaves();
            checkIsOwner();

            const contract = getWavePortalContract(dispatch);

            contract.on('NewWave', (_address, _timestamp, _message, random) => {
                setLoadingMessage('');
                getAllWaves();

                const isWinner = random.toNumber() <= 50;

                showLotteryResult(isWinner);
            });

            contract.on('RandomNumberRequested', () => setLoadingMessage('Generating Lottery Result...'));
        }
    }, [currentAccount]);

    const disableWaveButton = !isRinkeby || !!loadingMessage || !contractBalance;

    const renderOwnerContent = () => (
        <Card>
            <Box textAlign="center" mt="16px" fontSize="24px">
                <Text as="span" role="img" aria-label="wave">
                    👋
                </Text>{' '}
                Welcome back John!
            </Box>
            <Button onClick={deleteWaves} disabled={!isRinkeby || !!loadingMessage}>
                Delete Waves
            </Button>
        </Card>
    );

    const renderUserContent = () => (
        <Card>
            <Box textAlign="center" mt="16px" fontSize="24px">
                <Text as="span" role="img" aria-label="wave">
                    👋
                </Text>{' '}
                Hey there!
            </Box>

            <Text as="p" my="16px" textAlign="center">
                I'm John. Connect your Ethereum wallet and wave at me!
                <br />
                Every wave gives you a chance to win ETH!
            </Text>
        </Card>
    );

    const renderLotteryContent = () => (
        <Card>
            <Box textAlign="center">
                <Text>Lottery Prize Pool:</Text>
                <Text fontSize="2xl">{contractBalance} ETH</Text>
            </Box>
        </Card>
    );

    const renderConnectedContent = () => (
        <>
            <Card>
                <Textarea {...register('message')} name="message" />
                <Button onClick={handleSubmit(wave)} disabled={disableWaveButton}>
                    {loadingMessage ? loadingMessage : 'Wave at Me'}
                </Button>

                {lotteryResultMessage ? <Text>{lotteryResultMessage}</Text> : null}
            </Card>

            <Card>
                {allWaves.map((wave, index) => {
                    return (
                        <Box
                            key={index}
                            mb={index === allWaves.length - 1 ? '0' : '16px'}
                            p="16px"
                            bgColor="main.200"
                            borderRadius="lg"
                        >
                            <Text>Address: {wave.address}</Text>
                            <Text>Time: {wave.timestamp.toString()}</Text>
                            <Text>Message: {wave.message}</Text>
                        </Box>
                    );
                })}
            </Card>
        </>
    );

    return (
        <Flex>
            <Layout>
                <Flex justifyContent="center" width="100%">
                    <Flex direction="column" justifyContent="center" maxW="700px">
                        <Text
                            fontWeight="bold"
                            fontSize="36px"
                            m={0}
                            bgGradient="linear(43deg, rgb(217, 76, 214) 12.66%, rgb(81, 182, 249) 121.19%, rgba(217, 76, 214, 0) 121.2%)"
                            bgClip="text"
                            textAlign="center"
                        >
                            Wave Portal
                        </Text>

                        {isRinkeby ? (
                            <>
                                {isOwner ? renderOwnerContent() : renderUserContent()}

                                {currentAccount && contractBalance !== '' ? renderLotteryContent() : null}

                                {!!currentAccount ? (
                                    renderConnectedContent()
                                ) : (
                                    <Button onClick={connectWallet}>Connect Wallet</Button>
                                )}
                            </>
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'red', lineHeight: '30px' }}>
                                You must be connected to the Ethereum Rinkeby test network to use this application.
                                <br /> Please switch to the Rinkeby network.
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Layout>
        </Flex>
    );
};

export default App;
