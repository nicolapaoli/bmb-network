'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const IdCard = require('composer-common').IdCard;
const MemoryCardStore = require('composer-common').MemoryCardStore;
const path = require('path');

const cardStore = new MemoryCardStore();

const connectionProfile = {
    name: 'embedded',
    type: 'embedded'
};

const adminCardName = 'admin';


module.exports.getAdminConnection = function(){

    let adminConnection;

    const credentials = {
        certificate: 'FAKE CERTIF',
        privateKey: 'FAKE PK'
    };

    const deployerMetadata = {
        version: 1,
        userName: 'PeerAdmin',
        roles: [ 'PeerAdmin', 'ChannelAdmin']
    };

    const deployerCard = new IdCard(deployerMetadata, connectionProfile);
    deployerCard.setCredentials(credentials);
    const deployerCardName = 'PeerAdmin';

    adminConnection = new AdminConnection({
        cardStore: cardStore
    });

    return adminConnection.importCard(deployerCardName, deployerCard)
        .then(function() {
            return adminConnection.connect(deployerCardName);
        })
        .then(function(){
            return adminConnection;
        });
};

module.exports.deployBusinessNetwork = function(adminConnection){
    let businessNetworkConnection;
    let businessNetworkDefinition;

    return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'))
        .then(function(definition) {
            businessNetworkDefinition = definition;
            return adminConnection.install(definition.getName());
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
            businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
            return businessNetworkConnection.connect(adminCardName);
        })
        .then(function() {
            return businessNetworkConnection;
        });
};

module.exports.importIdentityCard = function(adminConnection,cardName, identity, businessNetworkName) {
    const metadata = {
        userName: identity.userID,
        version: 1,
        enrollmentSecret: identity.userSecret,
        businessNetwork: businessNetworkName
    };
    const card = new IdCard(metadata, connectionProfile);
    return adminConnection.importCard(cardName, card);
};

module.exports.useIdentity = function useIdentity(businessNetworkConnection, cardName) {
    return businessNetworkConnection.disconnect()
        .then(function() {
            businessNetworkConnection = new BusinessNetworkConnection({cardStore: cardStore});
            return businessNetworkConnection.connect(cardName);
        })
        .then(function() {
            return businessNetworkConnection;
        });
};