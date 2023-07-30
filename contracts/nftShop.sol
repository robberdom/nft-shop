// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./MyERC20Token.sol";

contract nftShop {
    uint256 public ratio;
    MyERC20Token public paymentToken;

    constructor(uint256 _ratio, MyERC20Token _paymentToken) {
        ratio = _ratio;
        paymentToken = _paymentToken;
    }

    function buyTokens() external payable {
        paymentToken.mint(msg.sender, msg.value * ratio);
    }
}
