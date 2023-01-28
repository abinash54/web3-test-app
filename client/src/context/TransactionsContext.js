import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {contractABI, contractAddress} from '../utils/constants';
import { BsWindowSidebar } from 'react-icons/bs';

export const TransactionContext = React.createContext();

// this is the link through which blockchain interaction will be done
const { ethereum } = window;

const getEthereumContract = ()=>{
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(
        contractAddress, 
        contractABI, 
        signer
    )
    // this will be used to call contract functions
    return transactionContract;
}

export const TransactionProvider =({children})=> {

    const [transactionDone, setTransactionDone] = useState(localStorage.getItem('transactionCount'));
    const [loader, setLoader] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('')
    const [formData, setFormData] = useState({
        addressTo:'',
        amount:'',
        keyword:'',
        message:''
    });
    const [txList, setTxList] = useState([]);

    const handleFormData =async(e, name)=>{
        setFormData((prevState)=>({
            ...prevState,
            [name]:e.target.value
        }))
    }
    // checking if account is connected
    const checkIfWallterConnected = async()=>{
        try {
            if(!ethereum) return alert('install fukcing metamask')
            const accounts = await ethereum.request({
                method:'eth_accounts',
            });
            if (accounts.length === 1) setConnectedAccount(accounts[0]);
            else if(accounts.length === 0) console.log('no accounts found');
            // get all transactions
            getAllTransactions();

        } catch (error) {
            console.log(error);
            throw new Error('no ethereum object');
        }
    }

    useEffect(()=>{
        checkIfWallterConnected();
        checkIfTransactionExists();
    }, []);

    // function to connect to the account
    const connectWallet =async()=>{
        try {
            if(!ethereum) return alert('install fukcing metamask');
            const accounts = await ethereum.request({
                method:'eth_requestAccounts',
            });
            setConnectedAccount(accounts[0]);

        } catch (error) {
            console.log(error);

            throw new Error('no ethereum object')
        }
    }

    // to send a transaction
    const sendTransaction = async()=>{
        try {
            if(!ethereum) return alert('install fukcing metamask');
            const { addressTo, amount, keyword, message } = formData;
            const parsedAmount = ethers.utils.parseEther(amount);
            const transactionContract = getEthereumContract();

            await ethereum.request({
                method:'eth_sendTransaction',
                params:[{
                    from: connectedAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value:parsedAmount._hex,

                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword
            );
            setLoader(true);
            console.log(`loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setLoader(false);
            console.log(`success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionDone(transactionCount.toNumber());

        } catch (error) {
            console.log(error)
        }
    }

    // check if transaction exists
    const checkIfTransactionExists = async() => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
            window.localStorage.setItem('transactionCount', transactionCount);

        } catch (error) {
            console.log(error)
        }
    }

    // get all transactions
    const getAllTransactions = async() => {
        try {
            if(!ethereum) return alert('install fukcing metamask');
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            setTxList(availableTransactions.map((tx)=>({
                addressTo: tx.receiver,
                addressFrom: tx.sender,
                timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
                message: tx.message,
                keyword: tx.keyword,
                amount: parseInt(tx.amount._hex) / (10 ** 18)
      
                })
            ))
            console.log(availableTransactions);
        } catch (error) {
            console.log(error)
        }

    }
    

    return (
        <TransactionContext.Provider value={{ 
            connectWallet, 
            connectedAccount,
            formData, setFormData, handleFormData,
            sendTransaction,
            txList
        }}>
            {children}
        </TransactionContext.Provider>
    )
}
