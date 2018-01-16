/**
 * This files contains the logic to create and trade the assets
 */

'use strict';

/**
 * Create asset Transaction
 * @param {ie.nicolapaoli.bmbnetwork.CreateAsset} createAsset - The transaction createAsset
 * @transaction
 */
function createAsset(createAsset) {
    console.log('Transaction CreateAsset Start');

    //Checking the participant is a Boss.
    var currentParticipant = getCurrentParticipant();
    if (currentParticipant.getFullyQualifiedType() !== 'ie.nicolapaoli.bmbnetwork.Boss') {
        console.log('Transaction CreateAsset End. Participant is not a Boss');
        throw new Error('Only a Boss can create an asset');
    }

    var factory = getFactory();
    var NS = 'ie.nicolapaoli.bmbnetwork';

    //Creating the new asset with the param in the transaction
    var newAsset = factory.newResource(NS, 'GeneralAsset', createAsset.symbol);
    newAsset.symbol = createAsset.symbol;
    newAsset.name = createAsset.name;
    newAsset.assetCreator = factory.newRelationship(NS, 'Boss', currentParticipant.getIdentifier());
    newAsset.assetOwner = factory.newRelationship(NS, 'Boss', currentParticipant.getIdentifier());

    //Save the asset in the registry and return
    return getAssetRegistry(newAsset.getFullyQualifiedType())
        .then(function(registry) {
            return registry.add(newAsset);
        })
        .then(function(){
            console.log('Transaction CreateAsset End');
        });
}

/**
 * Send asset transaction
 * @param {ie.nicolapaoli.bmbnetwork.SendAsset} sendAsset - The SendAsset transaction
 * @transaction
 */
function sendAsset(sendAsset) {
    console.log('Transaction SendAsset Start');

    //Checking the participant is a Boss.
    var currentParticipant = getCurrentParticipant();
    if (currentParticipant.getFullyQualifiedType() !== 'ie.nicolapaoli.bmbnetwork.Beneficiary') {
        console.log('Transaction SendAsset End with error');
        throw new Error('Only a Beneficiary can send an asset');
    }

    var NS = 'ie.nicolapaoli.bmbnetwork';
    var factory = getFactory();

    var newOwner = sendAsset.newOwner;
    var theAsset = sendAsset.assetToSend;

    theAsset.assetOwner = newOwner;

    return getAssetRegistry(theAsset.getFullyQualifiedType())
        .then(function(ar) {
            return ar.update(theAsset);
        })
        .then(function() {
            console.log('Transaction SendAsset End');
        });
}