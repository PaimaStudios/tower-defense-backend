import cors from 'cors';
import express from 'express';
import type { Pool } from 'pg';

import AddressValidator from '@paima-batcher/address-validator';
import { getInputState, insertStateValidating, insertUnvalidatedInput } from '@paima-batcher/db';
import type { ErrorMessageFxn } from '@paima-batcher/utils';
import {
  AddressType,
  keepRunning,
  setWebserverClosed,
  unsetWebserverClosed,
} from '@paima-batcher/utils';
import { CHAIN_URI, BATCHER_PORT, hashInput } from '@paima-batcher/utils';

const port = BATCHER_PORT;

let pool: Pool;

const server = express();
const bodyParser = express.json();
server.use(cors());
server.use(bodyParser);

async function initializeServer(errorCodeToMessage: ErrorMessageFxn, pool: Pool) {
  const addressValidator = new AddressValidator(CHAIN_URI, pool);
  await addressValidator.initialize();

  server.get('/track_user_input', async (req, res) => {
    try {
      if (!req.query.hasOwnProperty('input_hash')) {
        res.status(400).json({
          success: false,
          message: 'Invalid request options',
        });
        return;
      }

      const hash = (req.query.input_hash as string) || '';

      if (!keepRunning) {
        res.status(500).json({
          success: false,
          message: 'Batcher shutting down',
        });
        return;
      }

      const results = await getInputState.run({ input_hash: hash }, pool);

      if (results.length === 0) {
        res.status(200).json({
          success: false,
          message: 'Hash not found',
          hash,
        });
        return;
      }
      if (results.length > 1) {
        console.log('[webserver] WARNING: multiple results for hash', hash);
      }

      const result = results[0];
      const status = result.current_state;
      let returnValue: any;
      const returnValueCore = {
        success: true,
        hash,
        status,
      };
      if (status === 'rejected') {
        returnValue = {
          ...returnValueCore,
          message: errorCodeToMessage(result.rejection_code || 0),
        };
      } else if (status === 'posted') {
        returnValue = {
          ...returnValueCore,
          block_height: result.block_height,
          transaction_hash: result.transaction_hash,
        };
      } else {
        returnValue = returnValueCore;
      }
      res.status(200).json(returnValue);
    } catch (err) {
      console.log('[webserver/track_user_input] error:', err);
      res.status(500).json({
        success: false,
        message: 'Unknown server error, please contact admin',
      });
    }
  });

  server.post('/submit_user_input', async (req, res) => {
    try {
      const expectedProps = [
        'address_type',
        'user_address',
        'game_input',
        'timestamp',
        'user_signature',
      ];
      const requestValid = expectedProps.every(prop => req.body.hasOwnProperty(prop));
      if (!requestValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid request options',
        });
        return;
      }

      const [addressType, userAddress, gameInput, millisecondTimestamp, userSignature] = [
        req.body.address_type || AddressType.UNKNOWN,
        (req.body.user_address as string) || '',
        (req.body.game_input as string) || '',
        (req.body.timestamp as string) || '',
        (req.body.user_signature as string) || '',
      ];
      const input = {
        addressType,
        userAddress,
        gameInput,
        millisecondTimestamp,
        userSignature,
      };
      const hash = hashInput(input);

      if (!keepRunning) {
        res.status(500).json({
          success: false,
          message: 'Batcher shutting down',
        });
        return;
      }

      const states = await getInputState.run({ input_hash: hash }, pool);
      if (states.length >= 1) {
        console.log('[webserver] Rejecting duplicate input!');
        res.status(400).json({
          success: false,
          message: 'Input has already been submitted',
        });
        return;
      }

      if (!keepRunning) {
        res.status(500).json({
          success: false,
          message: 'Batcher shutting down',
        });
        return;
      }

      const validity = await addressValidator.validateUserInput(input);

      if (!keepRunning) {
        res.status(500).json({
          success: false,
          message: 'Batcher shutting down',
        });
        return;
      }

      if (validity === 0) {
        try {
          unsetWebserverClosed();
          await insertStateValidating.run({ input_hash: hash }, pool);
          await insertUnvalidatedInput.run(
            {
              address_type: addressType,
              user_address: userAddress,
              game_input: gameInput,
              millisecond_timestamp: millisecondTimestamp,
              user_signature: userSignature,
            },
            pool
          );
          setWebserverClosed();
        } catch (err) {
          console.log('[webserver] Error while setting input as validated.');
          res.status(500).json({
            success: false,
            message: 'Internal server error',
          });
          return;
        }
        console.log('[webserver] Input has been accepted!');
        res.status(200).json({
          success: true,
          hash: hash,
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          message: errorCodeToMessage(validity),
          code: validity,
        });
        return;
      }
    } catch (err) {
      console.log('[webserver/submit_user_input] error:', err);
      res.status(500).json({
        success: false,
        message: 'Unknown server error, please contact admin',
      });
    }
  });
}

async function startServer(_pool: Pool, errorCodeToMessage: ErrorMessageFxn) {
  pool = _pool;
  await initializeServer(errorCodeToMessage, pool);
  setWebserverClosed();
  server.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
}

export { server, startServer };
