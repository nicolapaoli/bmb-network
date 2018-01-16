'use strict';

const Util = require('./Util');

const should = require('chai').should();

const NS = 'ie.nicolapaoli.bmbnetwork';

describe('Setup', function() {
    let businessNetworkConnection;
    let factory;

    beforeEach(function() {
        return Util.deployAndConnect()
            .then(function(connection) {
                businessNetworkConnection = connection;
                factory = businessNetworkConnection.getBusinessNetwork().getFactory();
            });
    });

    describe('Setting up the BMB Network', function() {
        describe('#SetupBMB', function() {

            /**
             * @param {String} registry - name of the selected registry
             */
            function getAllFromRegistry(type, registry){
                const func = 'get' + type + 'Registry';
                return businessNetworkConnection[func](registry)
                    .then(function(registry) {
                        return registry.getAll();
                    });
            }

            it('should create the starting scenario', function() {
                // Submit the transaction SetupBMB
                const setupBMB = factory.newTransaction(NS, 'SetupBMB');

                return businessNetworkConnection.submitTransaction(setupBMB)
                    .then(function() {
                        return getAllFromRegistry('Participant', NS + '.Boss');
                    })
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

        });
    });
});