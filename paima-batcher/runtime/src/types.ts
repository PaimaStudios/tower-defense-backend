import { RequestHandler } from "express";
import BatchedTransactionPoster from "@paima-batcher/batched-transaction-poster";
import GameInputValidator from "@paima-batcher/game-input-validator";
import type { Pool } from "pg";

export interface BatcherRuntimeInitializer {
    initialize: (pool: Pool) => BatcherRuntime;
}

export interface BatcherRuntime {
    addGET: (route: string, callback: RequestHandler) => void;
    addPOST: (route: string, callback: RequestHandler) => void;
    run: (
        gameInputValidator: GameInputValidator,
        BatchedTransactionPoster: BatchedTransactionPoster
    ) => Promise<void>;
}
