/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userConfigsController } from './../controllers/allConfigs';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { configController } from './../controllers/config';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { currentRoundController } from './../controllers/currentRound';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { lobbyStateController } from './../controllers/lobbyState';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { lobbyStatusController } from './../controllers/lobbyStatus';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MapLayoutController } from './../controllers/mapLayout';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { matchExecutorController } from './../controllers/matchExecutor';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchWinnerController } from './../controllers/matchWinner';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { openLobbiesController } from './../controllers/openLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RandomActiveLobbyController } from './../controllers/randomActiveLobby';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RandomLobbyController } from './../controllers/randomLobby';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { roundExecutorController } from './../controllers/roundExecutor';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SearchOpenLobbiesController } from './../controllers/searchOpenLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserFinishedLobbiesController } from './../controllers/userFinishedLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserLobbiesController } from './../controllers/userLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserLobbiesBlockheightController } from './../controllers/userLobbiesBlockheight';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userNFTController } from './../controllers/userNFT';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userStatsController } from './../controllers/userStats';
import type { RequestHandler } from 'express';
import * as express from 'express';

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "IGetUserConfigsResult": {
        "dataType": "refObject",
        "properties": {
            "content": {"dataType":"string","required":true},
            "creator": {"dataType":"string","required":true},
            "id": {"dataType":"string","required":true},
            "version": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Response": {
        "dataType": "refObject",
        "properties": {
            "configs": {"dataType":"array","array":{"dataType":"refObject","ref":"IGetUserConfigsResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MapLayoutResponse": {
        "dataType": "refObject",
        "properties": {
            "map_layout": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LobbyStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["open"]},{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["finished"]},{"dataType":"enum","enums":["closed"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchWinnerResponse": {
        "dataType": "refObject",
        "properties": {
            "match_status": {"ref":"LobbyStatus","required":true},
            "winner_address": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "role_setting": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["attacker"]},{"dataType":"enum","enums":["defender"]},{"dataType":"enum","enums":["random"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Json": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[null]},{"dataType":"boolean"},{"dataType":"double"},{"dataType":"string"},{"dataType":"array","array":{"dataType":"refAlias","ref":"Json"}},{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"Json"}}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "lobby_status": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["closed"]},{"dataType":"enum","enums":["finished"]},{"dataType":"enum","enums":["open"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetRandomActiveLobbyResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "config_id": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"datetime","required":true},
            "creation_block_height": {"dataType":"double","required":true},
            "creator_faction": {"ref":"role_setting","required":true},
            "current_match_state": {"ref":"Json","required":true},
            "current_round": {"dataType":"double","required":true},
            "hidden": {"dataType":"boolean","required":true},
            "lobby_creator": {"dataType":"string","required":true},
            "lobby_id": {"dataType":"string","required":true},
            "lobby_state": {"ref":"lobby_status","required":true},
            "map": {"dataType":"string","required":true},
            "num_of_rounds": {"dataType":"double","required":true},
            "player_two": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "practice": {"dataType":"boolean","required":true},
            "round_length": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RandomActiveLobbyResponse": {
        "dataType": "refObject",
        "properties": {
            "lobby": {"dataType":"union","subSchemas":[{"ref":"IGetRandomActiveLobbyResult"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetRandomLobbyResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "config_id": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"datetime","required":true},
            "creation_block_height": {"dataType":"double","required":true},
            "creator_faction": {"ref":"role_setting","required":true},
            "current_match_state": {"ref":"Json","required":true},
            "current_round": {"dataType":"double","required":true},
            "hidden": {"dataType":"boolean","required":true},
            "lobby_creator": {"dataType":"string","required":true},
            "lobby_id": {"dataType":"string","required":true},
            "lobby_state": {"ref":"lobby_status","required":true},
            "map": {"dataType":"string","required":true},
            "num_of_rounds": {"dataType":"double","required":true},
            "player_two": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "practice": {"dataType":"boolean","required":true},
            "round_length": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RandomLobbyResponse": {
        "dataType": "refObject",
        "properties": {
            "lobby": {"dataType":"union","subSchemas":[{"ref":"IGetRandomLobbyResult"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ISearchPaginatedOpenLobbiesResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "config_id": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "created_at": {"dataType":"datetime","required":true},
            "creation_block_height": {"dataType":"double","required":true},
            "creator_faction": {"ref":"role_setting","required":true},
            "current_match_state": {"ref":"Json","required":true},
            "current_round": {"dataType":"double","required":true},
            "hidden": {"dataType":"boolean","required":true},
            "lobby_creator": {"dataType":"string","required":true},
            "lobby_id": {"dataType":"string","required":true},
            "lobby_state": {"ref":"lobby_status","required":true},
            "map": {"dataType":"string","required":true},
            "num_of_rounds": {"dataType":"double","required":true},
            "player_two": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "practice": {"dataType":"boolean","required":true},
            "round_length": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchOpenLobbiesResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbies": {"dataType":"array","array":{"dataType":"refObject","ref":"ISearchPaginatedOpenLobbiesResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: express.Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/user_configs',
            ...(fetchMiddlewares<RequestHandler>(userConfigsController)),
            ...(fetchMiddlewares<RequestHandler>(userConfigsController.prototype.get)),

            function userConfigsController_get(request: any, response: any, next: any) {
            const args = {
                    creator: {"in":"query","name":"creator","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new userConfigsController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/config',
            ...(fetchMiddlewares<RequestHandler>(configController)),
            ...(fetchMiddlewares<RequestHandler>(configController.prototype.get)),

            function configController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new configController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/current_round',
            ...(fetchMiddlewares<RequestHandler>(currentRoundController)),
            ...(fetchMiddlewares<RequestHandler>(currentRoundController.prototype.get)),

            function currentRoundController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new currentRoundController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/lobby_state',
            ...(fetchMiddlewares<RequestHandler>(lobbyStateController)),
            ...(fetchMiddlewares<RequestHandler>(lobbyStateController.prototype.get)),

            function lobbyStateController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new lobbyStateController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/lobby_status',
            ...(fetchMiddlewares<RequestHandler>(lobbyStatusController)),
            ...(fetchMiddlewares<RequestHandler>(lobbyStatusController.prototype.get)),

            function lobbyStatusController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new lobbyStatusController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/map_layout',
            ...(fetchMiddlewares<RequestHandler>(MapLayoutController)),
            ...(fetchMiddlewares<RequestHandler>(MapLayoutController.prototype.get)),

            function MapLayoutController_get(request: any, response: any, next: any) {
            const args = {
                    mapName: {"in":"query","name":"mapName","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MapLayoutController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/match_executor',
            ...(fetchMiddlewares<RequestHandler>(matchExecutorController)),
            ...(fetchMiddlewares<RequestHandler>(matchExecutorController.prototype.get)),

            function matchExecutorController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new matchExecutorController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/match_winner',
            ...(fetchMiddlewares<RequestHandler>(MatchWinnerController)),
            ...(fetchMiddlewares<RequestHandler>(MatchWinnerController.prototype.get)),

            function MatchWinnerController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new MatchWinnerController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/open_lobbies',
            ...(fetchMiddlewares<RequestHandler>(openLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(openLobbiesController.prototype.get)),

            function openLobbiesController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new openLobbiesController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/random_active_lobby',
            ...(fetchMiddlewares<RequestHandler>(RandomActiveLobbyController)),
            ...(fetchMiddlewares<RequestHandler>(RandomActiveLobbyController.prototype.get)),

            function RandomActiveLobbyController_get(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RandomActiveLobbyController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/random_lobby',
            ...(fetchMiddlewares<RequestHandler>(RandomLobbyController)),
            ...(fetchMiddlewares<RequestHandler>(RandomLobbyController.prototype.get)),

            function RandomLobbyController_get(request: any, response: any, next: any) {
            const args = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new RandomLobbyController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/round_executor',
            ...(fetchMiddlewares<RequestHandler>(roundExecutorController)),
            ...(fetchMiddlewares<RequestHandler>(roundExecutorController.prototype.get)),

            function roundExecutorController_get(request: any, response: any, next: any) {
            const args = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
                    round: {"in":"query","name":"round","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new roundExecutorController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/search_open_lobbies',
            ...(fetchMiddlewares<RequestHandler>(SearchOpenLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(SearchOpenLobbiesController.prototype.get)),

            function SearchOpenLobbiesController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    searchQuery: {"in":"query","name":"searchQuery","required":true,"dataType":"string"},
                    page: {"in":"query","name":"page","dataType":"double"},
                    count: {"in":"query","name":"count","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new SearchOpenLobbiesController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_finished_lobbies',
            ...(fetchMiddlewares<RequestHandler>(UserFinishedLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(UserFinishedLobbiesController.prototype.get)),

            function UserFinishedLobbiesController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserFinishedLobbiesController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_lobbies',
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesController.prototype.get)),

            function UserLobbiesController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserLobbiesController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_lobbies_blockheight',
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesBlockheightController)),
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesBlockheightController.prototype.get)),

            function UserLobbiesBlockheightController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    blockHeight: {"in":"query","name":"blockHeight","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new UserLobbiesBlockheightController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_nft',
            ...(fetchMiddlewares<RequestHandler>(userNFTController)),
            ...(fetchMiddlewares<RequestHandler>(userNFTController.prototype.get)),

            function userNFTController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new userNFTController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_stats',
            ...(fetchMiddlewares<RequestHandler>(userStatsController)),
            ...(fetchMiddlewares<RequestHandler>(userStatsController.prototype.get)),

            function userStatsController_get(request: any, response: any, next: any) {
            const args = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new userStatsController();


              const promise = controller.get.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
