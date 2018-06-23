var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract('DappTokenSale', function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var numberOfTokens;

    it('initialize the contract with correct values',function(){
        return DappTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notEqual(address,0x0,'has a valid contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('facilitates token buying', function(){
        return DappToken.deployed().then(function(instance){
            // Get the token instance first.
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            // then get the token sale instance
            tokenSaleInstance = instance;
            //provision 75% of all token to token sale.
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin});
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of token purchased');
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of token sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokens)
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens)
            //Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0 ,'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0 ,'cannot purchase more tokens than available');
        });
    });

    it('ends token sale', function(){
        return DappToken.deployed().then(function(instance){
            // Get the token instance first.
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            // then get the token sale instance
            tokenSaleInstance = instance;
            //try to end sale from account other than admin.
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0 ,'must be admin to end the sale');
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 999990, 'retunrns all the unsold ari token to admin')
            //Check token price is reset when self destruct is called
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price.toNumber(), 0, 'price should be equal to zero');
        });
    });
});