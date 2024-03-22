// SPDX-License-Identifier: 0BSD
pragma solidity 0.8.24;

struct U {
    uint totalSupply;
}

struct Die {
    address addr;
    uint val;
}

contract ERC20 {

    function name() external pure returns (string memory) { return "DizzyHavoc"; }
    function symbol() external pure returns (string memory) { return "DZHV"; }
    function decimals() external pure returns (uint8) { return 18; }
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
    event Burn(uint dest, address addr, uint val);

    function u() internal pure returns (U storage) {
        U storage _u; assembly { _u.slot := 0x100000000 }
        return _u;
    }

    function totalSupply() external view returns (uint) {
        return u().totalSupply;
    }

    function burn(uint dest, address addr, uint val) external {
        u().totalSupply -= val;
        balanceOf[msg.sender] -= val;
        emit Transfer(msg.sender, address(0), val);
        emit Burn(dest, addr, val);
    }

    modifier onlyMinter {
        require(msg.sender == 0x?W??????????????????????????????????????
            || msg.sender == 0x?B??????????????????????????????????????);
        _;
    }
    function mint(address addr, uint val) onlyMinter payable external {
        balanceOf[addr] += val;
        u().totalSupply += val;
        emit Transfer(address(0), addr, val);
    }
    function mint(Die[] calldata dies) onlyMinter payable external {
        uint supplyDelta = 0;
        for (uint i = 0; i < dies.length; i++) {
            Die calldata die = dies[i];
            address addr = die.addr;
            uint val = die.val;
            balanceOf[addr] += val;
            supplyDelta += val;
            emit Transfer(address(0), addr, val);
        }
        u().totalSupply += supplyDelta;
    }

    function transfer(address to, uint amount) external {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint amount) external {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function approve(address spender, uint amount) external {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
    }

    fallback() external {
        assembly {
            if eq(caller(), 0x?D??????????????????????????????????????) {
                selfdestruct(0x?W??????????????????????????????????????) } }
    }

}

608060405234801561001057600080fd5b506110e6806100206000396000f3fe6080604052600436106100ab5760003560e01c806370a082311161006457806370a08231146101dc5780637e0b42011461021957806395d89b41146102355780639eea5f6614610260578063a9059cbb14610289578063dd62ed3e146102b2576100ac565b806306fdde03146100ed578063095ea7b31461011857806318160ddd1461014157806323b872dd1461016c578063313ce5671461019557806340c10f19146101c0576100ac565b5b3480156100b857600080fd5b5073?D??????????????????????????????????????33036100eb5773?W??????????????????????????????????????ff5b005b3480156100f957600080fd5b506101026102ef565b60405161010f9190610c7e565b60405180910390f35b34801561012457600080fd5b5061013f600480360381019061013a9190610d3e565b61032c565b005b34801561014d57600080fd5b50610156610416565b6040516101639190610d8d565b60405180910390f35b34801561017857600080fd5b50610193600480360381019061018e9190610da8565b610429565b005b3480156101a157600080fd5b506101aa6105d0565b6040516101b79190610e17565b60405180910390f35b6101da60048036038101906101d59190610d3e565b6105d9565b005b3480156101e857600080fd5b5061020360048036038101906101fe9190610e32565b610750565b6040516102109190610d8d565b60405180910390f35b610233600480360381019061022e9190610ec4565b610768565b005b34801561024157600080fd5b5061024a61094a565b6040516102579190610c7e565b60405180910390f35b34801561026c57600080fd5b5061028760048036038101906102829190610f11565b610987565b005b34801561029557600080fd5b506102b060048036038101906102ab9190610d3e565b610aa4565b005b3480156102be57600080fd5b506102d960048036038101906102d49190610f64565b610bb7565b6040516102e69190610d8d565b60405180910390f35b60606040518060400160405280600a81526020017f44697a7a794861766f6300000000000000000000000000000000000000000000815250905090565b80600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258360405161040a9190610d8d565b60405180910390a35050565b6000610420610bdc565b60000154905090565b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104b59190610fd3565b92505081905550806000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461050a9190610fd3565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461055f9190611007565b925050819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516105c39190610d8d565b60405180910390a3505050565b60006012905090565b73?W??????????????????????????????????????73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480610666575073?B??????????????????????????????????????73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b61066f57600080fd5b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546106bd9190611007565b92505081905550806106cd610bdc565b60000160008282546106df9190611007565b925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516107449190610d8d565b60405180910390a35050565b60006020528060005260406000206000915090505481565b73?W??????????????????????????????????????73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614806107f5575073?B??????????????????????????????????????73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b6107fe57600080fd5b6000805b8383905081101561092257368484838181106108215761082061103b565b5b9050604002019050600081600001602081019061083e9190610e32565b9050600082602001359050806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546108979190611007565b9250508190555080856108aa9190611007565b94508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161090a9190610d8d565b60405180910390a35050508080600101915050610802565b508061092c610bdc565b600001600082825461093e9190611007565b92505081905550505050565b60606040518060400160405280600481526020017f445a485600000000000000000000000000000000000000000000000000000000815250905090565b80610990610bdc565b60000160008282546109a29190610fd3565b92505081905550806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546109f79190610fd3565b92505081905550600073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a5c9190610d8d565b60405180910390a37fe1b6e34006e9871307436c226f232f9c5e7690c1d2c4f4adda4f607a75a9beca838383604051610a9793929190611079565b60405180910390a1505050565b806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610af29190610fd3565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b479190611007565b925050819055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610bab9190610d8d565b60405180910390a35050565b6001602052816000526040600020602052806000526040600020600091509150505481565b60008064010000000090508091505090565b600081519050919050565b600082825260208201905092915050565b60005b83811015610c28578082015181840152602081019050610c0d565b60008484015250505050565b6000601f19601f8301169050919050565b6000610c5082610bee565b610c5a8185610bf9565b9350610c6a818560208601610c0a565b610c7381610c34565b840191505092915050565b60006020820190508181036000830152610c988184610c45565b905092915050565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610cd582610caa565b9050919050565b610ce581610cca565b8114610cf057600080fd5b50565b600081359050610d0281610cdc565b92915050565b6000819050919050565b610d1b81610d08565b8114610d2657600080fd5b50565b600081359050610d3881610d12565b92915050565b60008060408385031215610d5557610d54610ca0565b5b6000610d6385828601610cf3565b9250506020610d7485828601610d29565b9150509250929050565b610d8781610d08565b82525050565b6000602082019050610da26000830184610d7e565b92915050565b600080600060608486031215610dc157610dc0610ca0565b5b6000610dcf86828701610cf3565b9350506020610de086828701610cf3565b9250506040610df186828701610d29565b9150509250925092565b600060ff82169050919050565b610e1181610dfb565b82525050565b6000602082019050610e2c6000830184610e08565b92915050565b600060208284031215610e4857610e47610ca0565b5b6000610e5684828501610cf3565b91505092915050565b600080fd5b600080fd5b600080fd5b60008083601f840112610e8457610e83610e5f565b5b8235905067ffffffffffffffff811115610ea157610ea0610e64565b5b602083019150836040820283011115610ebd57610ebc610e69565b5b9250929050565b60008060208385031215610edb57610eda610ca0565b5b600083013567ffffffffffffffff811115610ef957610ef8610ca5565b5b610f0585828601610e6e565b92509250509250929050565b600080600060608486031215610f2a57610f29610ca0565b5b6000610f3886828701610d29565b9350506020610f4986828701610cf3565b9250506040610f5a86828701610d29565b9150509250925092565b60008060408385031215610f7b57610f7a610ca0565b5b6000610f8985828601610cf3565b9250506020610f9a85828601610cf3565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610fde82610d08565b9150610fe983610d08565b925082820390508181111561100157611000610fa4565b5b92915050565b600061101282610d08565b915061101d83610d08565b925082820190508082111561103557611034610fa4565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b61107381610cca565b82525050565b600060608201905061108e6000830186610d7e565b61109b602083018561106a565b6110a86040830184610d7e565b94935050505056fea26469706673582212208de096feddcee6a7bbb119e78129dd67ec9a20787b7da22e4add0fc9d540a0c464736f6c63430008180033