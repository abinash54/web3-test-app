require('@nomiclabs/hardhat-waffle');

module.exports = {
    solidity:'0.8.0',
    networks:{
        localNetwork:{
            url:'HTTP://127.0.0.1:7545',
            accounts:[
                '16e27babea6fa41386c1e6cd85b0c1cb63545884f96a7f3c6f76ac59a87b61a1'
            ]
        }
    }
}