import { expect } from "chai";
import { BigNumber, ContractFactory, formatEther, } from "ethers";
import { ethers } from "hardhat";
import { beforeEach, describe, it } from "mocha";
import { MyERC20Token, MyERC20Token__factory, NftShop, NftShop__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import exp from "constants";

const TEST_RATIO = 10;
const TEST_BUY_TOKENS_AMOUNT = formatEther("1");
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

describe("NFT Shop", function() {
  let deployer: SignerWithAddress;
  let paymentToken: MyERC20Token;
  let acc1: SignerWithAddress;
  let acc2: SignerWithAddress;
  let nftShopContract: NftShop;

  beforeEach(async () => {
    [deployer, acc1, acc2] = await ethers.getSigners();
    const tokenFactory = new MyERC20Token__factory(deployer);
    paymentToken = await tokenFactory.deploy();
    await paymentToken.waitForDeployment();
    const contractFactory = new NftShop__factory(deployer);
    nftShopContract = await contractFactory.deploy(TEST_RATIO, paymentToken.getAddress());
    await nftShopContract.waitForDeployment(); // Add parentheses here to call the function
    const giveRoleTx = await paymentToken.grantRole(MINTER_ROLE, nftShopContract.getAddress());
    await giveRoleTx.wait();
  });

  describe("When the shop contract is deployed", () => {
    it("defines the ratio as provided in parameters", async () => {
      const ratio = await nftShopContract.ratio();
      expect(ratio).to.eq(TEST_RATIO);
      const paymentToken = await nftShopContract.paymentToken();
      console.log(`This is the payment token/myERC20Token address: ${paymentToken}`)
    });
  
  it("Uses a valid ERC20 token as payment",async () => {
    const tokenAddress = await nftShopContract.paymentToken(); //picks the address in myERC20Token contract and saves it here.
    const tokenFactory = new MyERC20Token__factory(deployer);
    const tokenContract = tokenFactory.attach(tokenAddress);
    await expect(tokenContract.totalSupply()).not.to.be.rejected;
    await expect(tokenContract.balanceOf(deployer.address)).not.to.be.rejected;
    await expect(tokenContract.approve(acc1.address, 1)).not.to.be.rejected;
  })
});
  describe("When a user buys an ERC20 from the NFT-Shop contract", () =>{
    let tokenBalanceAfter: BigNumber;
    let ethBalanceBefore: BigNumber;

    beforeEach(async () =>{
      tokenBalanceBefore = await paymentToken.balanceOf(acc1.address);
      const ethBalanceAfter = await acc1.getBalance();
      const buyTokensTx = await nftShopContract.connect(acc1).buyTokens({value: TEST_BUY_TOKENS_AMOUNT});
      const buyTokensTxReceipt = await buyTokensTx.wait();
    })
    it("charges the correct amount of ETH",async () => {
      const ethBalanceAfter = await acc1.getBalance();
      const ethBalanceDiff = ethBalanceBefore - ethBalanceAfter;
      expect(ethBalanceDiff).to.eq(TEST_BUY_TOKENS_AMOUNT)
    })
  

  it("gives the correct amount of tokens",async () => {
    const tokenBalanceAfter = await paymentToken.balanceOf(acc1.address);
    const tokenBalanceDiff = tokenBalanceAfter.sub - tokenBalanceBefore;
    expect(tokenBalanceDiff).to.be.eq(TEST_BUY_TOKENS_AMOUNT * TEST_RATIO);
      
  })})
});


