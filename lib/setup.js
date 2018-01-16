'use strict';
/**
 * Setup transaction
 * @param {ie.nicolapaoli.bmbnetwork.SetupBMB} setupBMB - The setupBMBTransaction
 * @transaction
 */
function setupBMB(SetupBMB) {
    console.log('SetupBMB Start');

    //Checking the participant is a Boss.
    var currentParticipant = getCurrentParticipant();
    if (currentParticipant.getFullyQualifiedType() !== 'org.hyperledger.composer.system.NetworkAdmin') {
        console.log('Transaction SetupBMB End. Participant is not the NetworkAdmin');
        throw new Error('Only the Network Admin can create participants');
    }

    var factory = getFactory();

    var NS = 'ie.nicolapaoli.bmbnetwork';

    var participants = {
        'boss': [
            {
                'userID':'boss001',
                'name':'Boss 001'
            }
        ],
        'beneficiary': [
            {
                'userID':'beneficiary001',
                'name':'Beneficiary 001'
            }
        ],
        'merchant': [
            {
                'userID': 'merchant001',
                'name':'Merchant 001'
            }
        ]
    };

    var bosses = [];
    var beneficiaries = [];
    var merchants = [];

    for (var i = 0; i<participants.boss.length; i++){
        var newBoss = factory.newResource(NS, 'Boss', participants.boss[i].userID);
        newBoss.name = participants.boss[i].name;
        bosses.push(newBoss);
    }

    for (var j = 0; j<participants.beneficiary.length; j++){
        var newBenef = factory.newResource(NS, 'Beneficiary', participants.beneficiary[j].userID);
        newBenef.name = participants.beneficiary[j].name;
        beneficiaries.push(newBenef);
    }

    for (var k = 0; k<participants.merchant.length; k++){
        var newMerchant = factory.newResource(NS, 'Merchant', participants.merchant[k].userID);
        newMerchant.name = participants.merchant[k].name;
        merchants.push(newMerchant);
    }

    return getParticipantRegistry(NS + '.Boss')
        .then(function(bossRegistry) {
            return bossRegistry.addAll(bosses);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Beneficiary');
        })
        .then(function(beneficiaryRegistry) {
            return beneficiaryRegistry.addAll(beneficiaries);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Merchant');
        })
        .then(function(merchantRegistry) {
            return merchantRegistry.addAll(merchants);
        });
}