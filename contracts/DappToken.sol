pragma solidity ^0.4.17;

contract DappToken {

    //Name
    string public name = "Ari Token";

    //Symbol
    string public symbol = "Ari";

    //standard
    //This is not part of ERC20 token
    string public standard = "Ari Token V1.0";

    // Constructor
    // Set the total no of tokens
    // Read the total no of tokens

    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value      
    );

    mapping(address => uint256) public balanceOf;

    function DappToken(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        Transfer(msg.sender, _to, _value);
        
        return true;
    }


}