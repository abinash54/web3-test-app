// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Transactions {
    // keep count of transactions, global
    uint256 transactionCount;
    
    // this is an event that signifies an actual transaction
    event Transfer(address from, address receiver, uint amount, string message, uint timestamp, string keyword); 

    // create the data structure for storing the transaction
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint timestamp;
        string keyword;
    }

    // array of all transaction
    TransferStruct[] transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        transactionCount += 1;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    function getAllTransactions() public view returns (TransferStruct[] memory) {
        // return transactions
        return transactions;
    }
    function getTransactionCount() public view returns (uint256) {
        // return count of transactions
        return transactionCount;
    }
}
