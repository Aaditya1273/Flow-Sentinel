transaction {
    prepare(signer: auth(Contracts) &Account) {
        signer.contracts.remove(name: "SentinelVaultFinal")
    }
}
