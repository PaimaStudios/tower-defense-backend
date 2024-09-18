/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TsoaRoute, fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userStatsController } from './../controllers/userStats';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userNFTController } from './../controllers/userNFT';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserLobbiesBlockheightController } from './../controllers/userLobbiesBlockheight';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserLobbiesController } from './../controllers/userLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserFinishedLobbiesController } from './../controllers/userFinishedLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SearchOpenLobbiesController } from './../controllers/searchOpenLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { roundExecutorController } from './../controllers/roundExecutor';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RandomLobbyController } from './../controllers/randomLobby';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RandomActiveLobbyController } from './../controllers/randomActiveLobby';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { openLobbiesController } from './../controllers/openLobbies';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MatchWinnerController } from './../controllers/matchWinner';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { matchExecutorController } from './../controllers/matchExecutor';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MapLayoutController } from './../controllers/mapLayout';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { lobbyStatusController } from './../controllers/lobbyStatus';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { lobbyStateController } from './../controllers/lobbyState';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { currentRoundController } from './../controllers/currentRound';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { configController } from './../controllers/config';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { userConfigsController } from './../controllers/allConfigs';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "IGetUserStatsResult": {
        "dataType": "refObject",
        "properties": {
            "losses": {"dataType":"double","required":true},
            "wallet": {"dataType":"string","required":true},
            "wins": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserStatsResponse": {
        "dataType": "refObject",
        "properties": {
            "stats": {"ref":"IGetUserStatsResult","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetUserNfTsResult": {
        "dataType": "refObject",
        "properties": {
            "address": {"dataType":"string","required":true},
            "block_height": {"dataType":"double","required":true},
            "timestamp": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}],"required":true},
            "token_id": {"dataType":"double","required":true},
            "wallet": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserNftResponse": {
        "dataType": "refObject",
        "properties": {
            "nft": {"ref":"IGetUserNfTsResult","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetNewLobbiesByUserAndBlockHeightResult": {
        "dataType": "refObject",
        "properties": {
            "lobby_id": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserLobbiesBlockheightResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbies": {"dataType":"array","array":{"dataType":"refObject","ref":"IGetNewLobbiesByUserAndBlockHeightResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "bot_difficulty": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["easy"]},{"dataType":"enum","enums":["hard"]}],"validators":{}},
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
    "UserLobby": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
            "myTurn": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserLobbiesResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbies": {"dataType":"array","array":{"dataType":"refObject","ref":"UserLobby"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetPaginatedUserLobbiesResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
    "UserFinishedLobbiesResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbies": {"dataType":"array","array":{"dataType":"refObject","ref":"IGetPaginatedUserLobbiesResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ISearchPaginatedOpenLobbiesResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
    "IGetBlockHeightResult": {
        "dataType": "refObject",
        "properties": {
            "block_height": {"dataType":"double","required":true},
            "done": {"dataType":"boolean","required":true},
            "seed": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetLobbyByIdResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
    "DefenderStructureType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["anacondaTower"]},{"dataType":"enum","enums":["slothTower"]},{"dataType":"enum","enums":["piranhaTower"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttackerStructureType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["macawCrypt"]},{"dataType":"enum","enums":["gorillaCrypt"]},{"dataType":"enum","enums":["jaguarCrypt"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StructureType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"DefenderStructureType"},{"ref":"AttackerStructureType"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Faction": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["attacker"]},{"dataType":"enum","enums":["defender"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BuildStructureAction": {
        "dataType": "refObject",
        "properties": {
            "round": {"dataType":"double","required":true},
            "faction": {"ref":"Faction","required":true},
            "action": {"dataType":"enum","enums":["build"],"required":true},
            "coordinates": {"dataType":"double","required":true},
            "structure": {"ref":"StructureType","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RepairStructureAction": {
        "dataType": "refObject",
        "properties": {
            "round": {"dataType":"double","required":true},
            "faction": {"ref":"Faction","required":true},
            "action": {"dataType":"enum","enums":["repair"],"required":true},
            "id": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SalvageStructureAction": {
        "dataType": "refObject",
        "properties": {
            "round": {"dataType":"double","required":true},
            "faction": {"ref":"Faction","required":true},
            "action": {"dataType":"enum","enums":["salvage"],"required":true},
            "id": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpgradeStructureAction": {
        "dataType": "refObject",
        "properties": {
            "round": {"dataType":"double","required":true},
            "faction": {"ref":"Faction","required":true},
            "action": {"dataType":"enum","enums":["upgrade"],"required":true},
            "id": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TurnAction": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"BuildStructureAction"},{"ref":"RepairStructureAction"},{"ref":"SalvageStructureAction"},{"ref":"UpgradeStructureAction"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetRoundDataResult": {
        "dataType": "refObject",
        "properties": {
            "execution_block_height": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"required":true},
            "id": {"dataType":"double","required":true},
            "lobby_id": {"dataType":"string","required":true},
            "match_state": {"ref":"Json","required":true},
            "round_within_match": {"dataType":"double","required":true},
            "starting_block_height": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundExecutorData": {
        "dataType": "refObject",
        "properties": {
            "block_height": {"ref":"IGetBlockHeightResult","required":true},
            "lobby": {"ref":"IGetLobbyByIdResult","required":true},
            "configString": {"dataType":"string","required":true},
            "moves": {"dataType":"array","array":{"dataType":"refAlias","ref":"TurnAction"},"required":true},
            "round_data": {"ref":"IGetRoundDataResult","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundExecutorError": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["lobby not found"]},{"dataType":"enum","enums":["bad round number"]},{"dataType":"enum","enums":["round not found"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundExecutorResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"RoundExecutorData"},{"ref":"RoundExecutorError"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IGetRandomLobbyResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
    "IGetRandomActiveLobbyResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
    "IGetPaginatedOpenLobbiesResult": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
            "losses": {"dataType":"double","required":true},
            "map": {"dataType":"string","required":true},
            "num_of_rounds": {"dataType":"double","required":true},
            "player_two": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "practice": {"dataType":"boolean","required":true},
            "round_length": {"dataType":"double","required":true},
            "wallet": {"dataType":"string","required":true},
            "wins": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OpenLobbiesResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbies": {"dataType":"array","array":{"dataType":"refObject","ref":"IGetPaginatedOpenLobbiesResult"},"required":true},
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
    "ExecutorDataSeed": {
        "dataType": "refObject",
        "properties": {
            "seed": {"dataType":"string","required":true},
            "block_height": {"dataType":"double","required":true},
            "round": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ETHAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CardanoAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PolkadotAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorandAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MinaAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WalletAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"ETHAddress"},{"ref":"CardanoAddress"},{"ref":"PolkadotAddress"},{"ref":"AlgorandAddress"},{"ref":"MinaAddress"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpgradeTier": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[1]},{"dataType":"enum","enums":[2]},{"dataType":"enum","enums":[3]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttackerBase": {
        "dataType": "refObject",
        "properties": {
            "level": {"ref":"UpgradeTier","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefenderBase": {
        "dataType": "refObject",
        "properties": {
            "coordinates": {"dataType":"double","required":true},
            "health": {"dataType":"double","required":true},
            "level": {"ref":"UpgradeTier","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DefenderStructure": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["structure"],"required":true},
            "faction": {"dataType":"enum","enums":["defender"],"required":true},
            "id": {"dataType":"double","required":true},
            "structure": {"ref":"DefenderStructureType","required":true},
            "health": {"dataType":"double","required":true},
            "coordinates": {"dataType":"double","required":true},
            "upgrades": {"ref":"UpgradeTier","required":true},
            "lastShot": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_ActorID.DefenderStructure_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"DefenderStructure"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActorID": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttackerStructure": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["structure"],"required":true},
            "id": {"dataType":"double","required":true},
            "faction": {"dataType":"enum","enums":["attacker"],"required":true},
            "structure": {"ref":"AttackerStructureType","required":true},
            "upgrades": {"ref":"UpgradeTier","required":true},
            "coordinates": {"dataType":"double","required":true},
            "builtOnRound": {"dataType":"double","required":true},
            "spawned": {"dataType":"array","array":{"dataType":"refAlias","ref":"ActorID"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_ActorID.AttackerStructure_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"AttackerStructure"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttackerUnitType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["macaw"]},{"dataType":"enum","enums":["jaguar"]},{"dataType":"enum","enums":["gorilla"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StatusType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["speedDebuff"]},{"dataType":"enum","enums":["speedBuff"]},{"dataType":"enum","enums":["healthBuff"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttackerUnit": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["unit"],"required":true},
            "faction": {"dataType":"enum","enums":["attacker"],"required":true},
            "subType": {"ref":"AttackerUnitType","required":true},
            "id": {"ref":"ActorID","required":true},
            "coordinates": {"dataType":"double","required":true},
            "movementCompletion": {"dataType":"double","required":true},
            "path": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "health": {"dataType":"double","required":true},
            "speed": {"dataType":"double","required":true},
            "damage": {"dataType":"double","required":true},
            "upgradeTier": {"ref":"UpgradeTier","required":true},
            "status": {"dataType":"array","array":{"dataType":"refAlias","ref":"StatusType"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_ActorID.AttackerUnit_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"ref":"AttackerUnit"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActorsObject": {
        "dataType": "refObject",
        "properties": {
            "towers": {"ref":"Record_ActorID.DefenderStructure_","required":true},
            "crypts": {"ref":"Record_ActorID.AttackerStructure_","required":true},
            "units": {"ref":"Record_ActorID.AttackerUnit_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PathTile": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["path"],"required":true},
            "faction": {"ref":"Faction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BlockedPathTile": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["blockedPath"],"required":true},
            "faction": {"ref":"Faction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BaseTile": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["base"],"required":true},
            "faction": {"ref":"Faction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OpenTile": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["open"],"required":true},
            "faction": {"ref":"Faction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UnbuildableTile": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"enum","enums":["unbuildable"],"required":true},
            "faction": {"ref":"Faction","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tile": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"PathTile"},{"ref":"BlockedPathTile"},{"ref":"BaseTile"},{"ref":"OpenTile"},{"ref":"UnbuildableTile"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchState": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "width": {"dataType":"double","required":true},
            "height": {"dataType":"double","required":true},
            "map": {"dataType":"array","array":{"dataType":"refAlias","ref":"Tile"},"required":true},
            "pathMap": {"dataType":"array","array":{"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":[0]},{"dataType":"enum","enums":[1]}]}},"required":true},
            "attacker": {"ref":"WalletAddress","required":true},
            "attackerGold": {"dataType":"double","required":true},
            "attackerBase": {"ref":"AttackerBase","required":true},
            "defender": {"ref":"WalletAddress","required":true},
            "defenderGold": {"dataType":"double","required":true},
            "defenderBase": {"ref":"DefenderBase","required":true},
            "actors": {"ref":"ActorsObject","required":true},
            "actorCount": {"dataType":"double","required":true},
            "currentRound": {"dataType":"double","required":true},
            "finishedSpawning": {"dataType":"array","array":{"dataType":"refAlias","ref":"ActorID"},"required":true},
            "roundEnded": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchExecutorData": {
        "dataType": "refObject",
        "properties": {
            "lobby": {"ref":"IGetLobbyByIdResult","required":true},
            "seeds": {"dataType":"array","array":{"dataType":"refObject","ref":"ExecutorDataSeed"},"required":true},
            "moves": {"dataType":"array","array":{"dataType":"refAlias","ref":"TurnAction"},"required":true},
            "initialState": {"ref":"MatchState","required":true},
            "configString": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchExecutorResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"MatchExecutorData"},{"dataType":"enum","enums":[null]}],"validators":{}},
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
    "LobbyStatusResponse": {
        "dataType": "refObject",
        "properties": {
            "lobbyStatus": {"dataType":"union","subSchemas":[{"ref":"LobbyStatus"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lobby": {
        "dataType": "refObject",
        "properties": {
            "autoplay": {"dataType":"boolean","required":true},
            "bot_difficulty": {"ref":"bot_difficulty","required":true},
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
            "player_states": {"ref":"IGetLobbyByIdResult"},
            "next_round_in": {"dataType":"nestedObjectLiteral","nestedProperties":{"calculated_at":{"dataType":"double","required":true},"seconds":{"dataType":"double","required":true}}},
            "round_start_height": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LobbyStateResponse": {
        "dataType": "refObject",
        "properties": {
            "lobby": {"dataType":"union","subSchemas":[{"ref":"Lobby"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoundData": {
        "dataType": "refObject",
        "properties": {
            "currentRound": {"dataType":"double","required":true},
            "roundStartHeight": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CurrentRoundError": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["round not found"]},{"dataType":"enum","enums":["lobby not found"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CurrentRoundResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"RoundData"},{"ref":"CurrentRoundError"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TowerConfig": {
        "dataType": "refObject",
        "properties": {
            "price": {"dataType":"double","required":true},
            "health": {"dataType":"double","required":true},
            "cooldown": {"dataType":"double","required":true},
            "damage": {"dataType":"double","required":true},
            "range": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_UpgradeTier.TowerConfig_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"1":{"ref":"TowerConfig","required":true},"2":{"ref":"TowerConfig","required":true},"3":{"ref":"TowerConfig","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TowerConfigGraph": {
        "dataType": "refAlias",
        "type": {"ref":"Record_UpgradeTier.TowerConfig_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CryptConfig": {
        "dataType": "refObject",
        "properties": {
            "price": {"dataType":"double","required":true},
            "cryptHealth": {"dataType":"double","required":true},
            "buffRange": {"dataType":"double","required":true},
            "buffCooldown": {"dataType":"double","required":true},
            "spawnRate": {"dataType":"double","required":true},
            "spawnCapacity": {"dataType":"double","required":true},
            "attackDamage": {"dataType":"double","required":true},
            "attackWarmup": {"dataType":"double","required":true},
            "attackRange": {"dataType":"double","required":true},
            "attackCooldown": {"dataType":"double","required":true},
            "unitSpeed": {"dataType":"double","required":true},
            "unitHealth": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_UpgradeTier.CryptConfig_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"1":{"ref":"CryptConfig","required":true},"2":{"ref":"CryptConfig","required":true},"3":{"ref":"CryptConfig","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CryptConfigGraph": {
        "dataType": "refAlias",
        "type": {"ref":"Record_UpgradeTier.CryptConfig_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MatchConfig": {
        "dataType": "refObject",
        "properties": {
            "defenderBaseHealth": {"dataType":"double","required":true},
            "maxAttackerGold": {"dataType":"double","required":true},
            "maxDefenderGold": {"dataType":"double","required":true},
            "baseAttackerGoldRate": {"dataType":"double","required":true},
            "baseDefenderGoldRate": {"dataType":"double","required":true},
            "anacondaTower": {"ref":"TowerConfigGraph","required":true},
            "piranhaTower": {"ref":"TowerConfigGraph","required":true},
            "slothTower": {"ref":"TowerConfigGraph","required":true},
            "macawCrypt": {"ref":"CryptConfigGraph","required":true},
            "gorillaCrypt": {"ref":"CryptConfigGraph","required":true},
            "jaguarCrypt": {"ref":"CryptConfigGraph","required":true},
            "baseSpeed": {"dataType":"double","required":true},
            "towerRepairValue": {"dataType":"double","required":true},
            "repairCost": {"dataType":"double","required":true},
            "recoupPercentage": {"dataType":"double","required":true},
            "healthBuffAmount": {"dataType":"double","required":true},
            "speedBuffAmount": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Config": {
        "dataType": "refObject",
        "properties": {
            "config": {"ref":"MatchConfig","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Error": {
        "dataType": "refObject",
        "properties": {
            "error": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["config not found"]},{"dataType":"enum","enums":["lobby not found"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConfigResponse": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Config"},{"ref":"Error"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
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
    "UserConfigsResponse": {
        "dataType": "refObject",
        "properties": {
            "configs": {"dataType":"array","array":{"dataType":"refObject","ref":"IGetUserConfigsResult"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################



        app.get('/user_stats',
            ...(fetchMiddlewares<RequestHandler>(userStatsController)),
            ...(fetchMiddlewares<RequestHandler>(userStatsController.prototype.get)),

            async function userStatsController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new userStatsController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_nft',
            ...(fetchMiddlewares<RequestHandler>(userNFTController)),
            ...(fetchMiddlewares<RequestHandler>(userNFTController.prototype.get)),

            async function userNFTController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new userNFTController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_lobbies_blockheight',
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesBlockheightController)),
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesBlockheightController.prototype.get)),

            async function UserLobbiesBlockheightController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    blockHeight: {"in":"query","name":"blockHeight","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new UserLobbiesBlockheightController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_lobbies',
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(UserLobbiesController.prototype.get)),

            async function UserLobbiesController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new UserLobbiesController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_finished_lobbies',
            ...(fetchMiddlewares<RequestHandler>(UserFinishedLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(UserFinishedLobbiesController.prototype.get)),

            async function UserFinishedLobbiesController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new UserFinishedLobbiesController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/search_open_lobbies',
            ...(fetchMiddlewares<RequestHandler>(SearchOpenLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(SearchOpenLobbiesController.prototype.get)),

            async function SearchOpenLobbiesController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    searchQuery: {"in":"query","name":"searchQuery","required":true,"dataType":"string"},
                    page: {"in":"query","name":"page","dataType":"double"},
                    count: {"in":"query","name":"count","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new SearchOpenLobbiesController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/round_executor',
            ...(fetchMiddlewares<RequestHandler>(roundExecutorController)),
            ...(fetchMiddlewares<RequestHandler>(roundExecutorController.prototype.get)),

            async function roundExecutorController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
                    round: {"in":"query","name":"round","required":true,"dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new roundExecutorController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/random_lobby',
            ...(fetchMiddlewares<RequestHandler>(RandomLobbyController)),
            ...(fetchMiddlewares<RequestHandler>(RandomLobbyController.prototype.get)),

            async function RandomLobbyController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new RandomLobbyController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/random_active_lobby',
            ...(fetchMiddlewares<RequestHandler>(RandomActiveLobbyController)),
            ...(fetchMiddlewares<RequestHandler>(RandomActiveLobbyController.prototype.get)),

            async function RandomActiveLobbyController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new RandomActiveLobbyController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/open_lobbies',
            ...(fetchMiddlewares<RequestHandler>(openLobbiesController)),
            ...(fetchMiddlewares<RequestHandler>(openLobbiesController.prototype.get)),

            async function openLobbiesController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    wallet: {"in":"query","name":"wallet","required":true,"dataType":"string"},
                    count: {"in":"query","name":"count","dataType":"double"},
                    page: {"in":"query","name":"page","dataType":"double"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new openLobbiesController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/match_winner',
            ...(fetchMiddlewares<RequestHandler>(MatchWinnerController)),
            ...(fetchMiddlewares<RequestHandler>(MatchWinnerController.prototype.get)),

            async function MatchWinnerController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new MatchWinnerController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/match_executor',
            ...(fetchMiddlewares<RequestHandler>(matchExecutorController)),
            ...(fetchMiddlewares<RequestHandler>(matchExecutorController.prototype.get)),

            async function matchExecutorController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new matchExecutorController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/map_layout',
            ...(fetchMiddlewares<RequestHandler>(MapLayoutController)),
            ...(fetchMiddlewares<RequestHandler>(MapLayoutController.prototype.get)),

            async function MapLayoutController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    mapName: {"in":"query","name":"mapName","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new MapLayoutController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/lobby_status',
            ...(fetchMiddlewares<RequestHandler>(lobbyStatusController)),
            ...(fetchMiddlewares<RequestHandler>(lobbyStatusController.prototype.get)),

            async function lobbyStatusController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new lobbyStatusController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/lobby_state',
            ...(fetchMiddlewares<RequestHandler>(lobbyStateController)),
            ...(fetchMiddlewares<RequestHandler>(lobbyStateController.prototype.get)),

            async function lobbyStateController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new lobbyStateController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/current_round',
            ...(fetchMiddlewares<RequestHandler>(currentRoundController)),
            ...(fetchMiddlewares<RequestHandler>(currentRoundController.prototype.get)),

            async function currentRoundController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new currentRoundController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/config',
            ...(fetchMiddlewares<RequestHandler>(configController)),
            ...(fetchMiddlewares<RequestHandler>(configController.prototype.get)),

            async function configController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    lobbyID: {"in":"query","name":"lobbyID","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new configController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/user_configs',
            ...(fetchMiddlewares<RequestHandler>(userConfigsController)),
            ...(fetchMiddlewares<RequestHandler>(userConfigsController.prototype.get)),

            async function userConfigsController_get(request: ExRequest, response: ExResponse, next: any) {
            const args: Record<string, TsoaRoute.ParameterSchema> = {
                    creator: {"in":"query","name":"creator","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args, request, response });

                const controller = new userConfigsController();

              await templateService.apiHandler({
                methodName: 'get',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
