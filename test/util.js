'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const IdCard = require('composer-common').IdCard;
const MemoryCardStore = require('composer-common').MemoryCardStore;

const path = require('path');

const NS = 'ie.nicolapaoli.bmbnetwork';

const cardStore = new MemoryCardStore();
const adminCardName = 'admin';

let adminConnection;
let bossCard;
let bossCardName = 'bossCard';

module.exports.deployAndConnect = function() {
    let adminConnection;
    let businessNetworkDefinition;
    let businessNetworkConnection;

    return getAdminConnection()
        .then(function(connection) {
            adminConnection = connection;
            return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname,'..'));
        })
        .then(function(definition) {
            businessNetworkDefinition = definition;
            return adminConnection.install(businessNetworkDefinition.getName());
        })
        .then(function() {
            const startOptions = {
                networkAdmins: [
                    {
                        userName: 'admin',
                        enrollmentSecret: 'adminpw'
                    }
                ]
            };
            return adminConnection.start(businessNetworkDefinition, startOptions);
        })
        .then(function(adminCards) {
            return adminConnection.importCard(adminCardName, adminCards.get('admin'));
        })
        .then(function() {
            businessNetworkConnection = new BusinessNetworkConnection(
                {
                    cardStore: cardStore
                });
            return businessNetworkConnection.connect(adminCardName);
        })
        .then(function() {
            return businessNetworkConnection;
        });
};

/**
 * Install cards and create admin connection
 * @returns {Promise} Resolves with a AdminConnection
 */
function getAdminConnection() {
    if (adminConnection) {
        return Promise.resolve(adminConnection);
    }

    const connectionProfile = {
        name: 'embedded',
        type: 'embedded'
    };

    const credentials = {
        certificate: 'FAKE CERTIF',
        privateKey: 'FAKE PK'
    };

    const deployerMetadata = {
        version: 1,
        userName: 'PeerAdmin',
        roles: ['PeerAdmin', 'ChannelAdmin']
    };

    const deployerCard = new IdCard(deployerMetadata, connectionProfile);
    deployerCard.setCredentials(credentials);

    const deployerCardName = 'deployer';

    adminConnection = new AdminConnection({cardStore: cardStore});

    return adminConnection.importCard(deployerCardName, deployerCard)
        .then(function() {
            return adminConnection.connect(deployerCardName);
        })
        .then(function() {
            return adminConnection;
        });
}