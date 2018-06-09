var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken',function(accounts){

    it('sets the total supply upon deployment', function(){
        return DappToken.deployed().then(function(instance){
            totalInstance = instance;
            return totalInstance.totalSupply();
        }).then(function(totalSupply){
            console.log(totalSupply);
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
        });
    });
});