/* @name setCardanoGenesisTrainer */
INSERT INTO cardano_genesis_trainer (token_id, owner)
VALUES (:token_id!, :owner!)
ON CONFLICT (token_id)
DO UPDATE SET
  owner = EXCLUDED.owner;

/* @name getCardanoGenesisTrainerById */
SELECT *
FROM cardano_genesis_trainer
WHERE owner = :owner!;

/*
  @name getCardanoGenesisTrainersByOwner
  @param owners -> (...)
*/
SELECT *
FROM cardano_genesis_trainer
WHERE owner IN :owners
ORDER BY token_id ASC;
