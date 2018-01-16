'use strict';

const Util = require('./util');
const should = require('chai').should();

const NS = 'ie.nicolapaoli.bmbnetwork';

let businessNetworkName;

const bossCardName = 'boss001';
const beneficiaryCardName = 'beneficiary001';
const merchantCardName = 'merchant001';


describe('Unit Test for BMB Network', function() {

    let adminConnection;
    let businessNetworkConnection;
    let factory;

    before('Obtaining the Admin Connection', function() {
        return Util.getAdminConnection()
            .then(function(connection) {
                adminConnection = connection;
            });
    });

    beforeEach('Deploy and setup the business network', function() {
        return Util.deployBusinessNetwork(adminConnection)
            .then(function(connection) {
                businessNetworkConnection = connection;

                factory = businessNetworkConnection.getBusinessNetwork().getFactory();
                businessNetworkName = businessNetworkConnection.getBusinessNetwork().getName();
            })
            .then(function() {
                const setupBMB = factory.newTransaction(NS, 'SetupBMB');
                // Submit the transaction SetupBMB
                return businessNetworkConnection.submitTransaction(setupBMB);
            });
    });

    it('should create the starting scenario', function() {
        /**
         * Function to get all the entities in the registry
         * @param {String} registry - name of the selected registry
         */
        function getAllFromRegistry(type, registry){
            const func = 'get' + type + 'Registry';
            return businessNetworkConnection[func](registry)
                .then(function(registry) {
                    return registry.getAll();
                });
        }
        return getAllFromRegistry('Participant', NS + '.Boss')
            .then(function(bosses) {
                //Testing number of Boss (1)
                bosses.length.should.equal(1);
            })
            .then(function() {
                return getAllFromRegistry('Participant', NS + '.Beneficiary');
            })
            .then(function(beneficiaries) {
                //Testing number of Beneficiary (1)
                beneficiaries.length.should.equal(1);
            })
            .then(function() {
                return getAllFromRegistry('Participant', NS + '.Merchant');
            })
            .then(function(merchants) {
                //Testing number of Merchant (1)
                merchants.length.should.equal(1);
            });
    });

    describe('Testing Transactions', function() {

        beforeEach(function() {

            return businessNetworkConnection.issueIdentity(`${NS}.Boss#${bossCardName}`, bossCardName)
                .then(function(identity) {
                    return Util.importIdentityCard(adminConnection, bossCardName, identity, businessNetworkName);
                })
                .then(function(connection) {
                    return businessNetworkConnection.issueIdentity(`${NS}.Beneficiary#${beneficiaryCardName}`,beneficiaryCardName);
                })
                .then(function(identity) {
                    return Util.importIdentityCard(adminConnection, beneficiaryCardName,identity, businessNetworkName);
                });
        });

        const newAssetSymbol = 'NEWASSET';
        const newAssetName = 'New Asset Name';

        it('should create an asset using the Boss identity', function() {
            return Util.useIdentity(businessNetworkConnection, bossCardName)
                .then (function(connection) {
                    businessNetworkConnection = connection;
                    const createAssetTransaction = factory.newTransaction(NS, 'CreateAsset');
                    createAssetTransaction.symbol = newAssetSymbol;
                    createAssetTransaction.name = newAssetName;
                    return businessNetworkConnection.submitTransaction(createAssetTransaction);
                })
                .then(function() {
                    return businessNetworkConnection.getAssetRegistry(NS + '.GeneralAsset');
                })
                .then(function(assetRegistry) {
                    return assetRegistry.get(newAssetSymbol);
                })
                .then(function(asset) {
                    should.exist(asset);
                    asset.symbol.should.equal(newAssetSymbol);
                });
        });
        it('should send an asset to the merchant using the Beneficiary identity', function() {
            return Util.useIdentity(businessNetworkConnection, bossCardName)
                .then (function(connection) {
                    businessNetworkConnection = connection;
                    const createAssetTransaction = factory.newTransaction(NS, 'CreateAsset');
                    createAssetTransaction.symbol = newAssetSymbol;
                    createAssetTransaction.name = newAssetName;
                    return businessNetworkConnection.submitTransaction(createAssetTransaction);
                })
                .then(function() {
                    return Util.useIdentity(businessNetworkConnection, beneficiaryCardName);
                })
                .then (function(connection) {
                    businessNetworkConnection = connection;
                    const sendAssetTransaction = factory.newTransaction(NS, 'SendAsset');
                    sendAssetTransaction.assetToSend = factory.newRelationship(NS, 'GeneralAsset', newAssetSymbol);
                    sendAssetTransaction.newOwner = factory.newRelationship(NS, 'Merchant', merchantCardName);
                    return businessNetworkConnection.submitTransaction(sendAssetTransaction);
                })
                .then(function() {
                    return businessNetworkConnection.getAssetRegistry(NS + '.GeneralAsset');
                })
                .then(function(assetRegistry) {
                    return assetRegistry.get(newAssetSymbol);
                })
                .then(function(asset) {
                    should.exist(asset);
                    asset.symbol.should.equal(newAssetSymbol);
                    asset.assetOwner.userID = merchantCardName;
                });
        });
    });
});