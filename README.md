
# BMB-Network (Boss-Merchant-Beneficiary Network)

*ie.nicolapaoli.bmbnetwork*

This is a simple network where three participants, a Boss, a Merchant and a Beneficiary, can trade some Assets.


---
## Participants

*   **Admin** - creates the participants and issues the identities
*   **Boss** - can only create a new asset
*   **Merchant** - can only read
*   **Beneficiary** - can send the merchant an asset

---
## Assets
*   **General Asset** - It's an asset with 2 properties:
    *Symbol* - the identifier;
    *Name* - the description.

---
## Transactions
*   **SetupBMB** - To setup the first Scenario - *Only accessible by the Network Admin*
*   **Create Asset** - To create a new asset - *Only accessible by the Boss*
*   **Send Asset** - To send an asset to a Merchant - *Only accessible by the Beneficiary*