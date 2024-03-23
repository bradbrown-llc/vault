// SPDX-FileCopyrightText: © 2023 BRAD BROWN, LLC <bradbrown@bradbrown.llc>
// SPDX-License-Identifier: BSD-3-Clause
pragma solidity 0.8.23;

library L {
    struct S {
        bool proxyErc20Initialized; 
        string name;
        string symbol;
        uint8 decimals;
        uint totalSupply;
        mapping (address => uint) balanceOf;
        mapping (address => mapping (address => uint)) allowance;
    }
    function g() internal pure returns (S storage s) {
        bytes32 x = keccak256("foo");
        assembly { s.slot := x }
    }
}

contract ProxyERC20 {

    address owner;

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
    
    function proxyErc20Initialized() external view returns (bool) { return L.g().proxyErc20Initialized; }
    function name() external view returns (string memory) { return L.g().name; }
    function symbol() external view returns (string memory) { return L.g().symbol; }
    function decimals() external view returns (uint8) { return L.g().decimals; }
    function totalSupply() external view returns (uint) { return L.g().totalSupply; }
    function balanceOf(address o) external view returns (uint) { return L.g().balanceOf[o]; }
    function allowance(address o, address s) external view returns (uint) { return L.g().allowance[o][s]; }
    
    function initProxyErc20() external {
        L.S storage s = L.g();
        require(!s.proxyErc20Initialized);
        require(msg.sender == owner);
        s.name = "GentleMidnight";
        s.symbol = "GTMN";
        s.decimals = 9;
        s.totalSupply = 1e9 * 1e9;
        s.balanceOf[owner] = s.totalSupply / 10;
        s.proxyErc20Initialized = true;
    }

    function transfer(address to, uint value) external {
        L.S storage s = L.g();
        s.balanceOf[msg.sender] -= value;
        s.balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
    }

    function approve(address spender, uint value) external {
        L.S storage s = L.g();
        s.allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
    }

    function transferFrom(address from, address to, uint value) external {
        L.S storage s = L.g();
        s.allowance[from][msg.sender] -= value;
        s.balanceOf[from] -= value;
        s.balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
    
    constructor() {}

}