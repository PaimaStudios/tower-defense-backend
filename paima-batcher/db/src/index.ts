import {
    insertUnvalidatedInput,
    getUnvalidatedInputs,
    deleteUnvalidatedInput,
    validateInput,
    getValidatedInputs,
    deleteValidatedInput,
    insertStateValidating,
    insertStateRejected,
    updateStateAccepted,
    updateStateRejected,
    updateStatePosted,
    getInputState,
    getUserTrackingEntry,
    addUserTrackingEntry,
    incrementUserTrackingSameMinute,
    incrementUserTrackingSameDay,
    incrementUserTrackingAnotherDay
} from "./sql/queries.queries.js";

export {
    insertUnvalidatedInput,
    getUnvalidatedInputs,
    deleteUnvalidatedInput,
    validateInput,
    getValidatedInputs,
    deleteValidatedInput,
    insertStateValidating,
    insertStateRejected,
    updateStateAccepted,
    updateStateRejected,
    updateStatePosted,
    getInputState,
    getUserTrackingEntry,
    addUserTrackingEntry,
    incrementUserTrackingSameMinute,
    incrementUserTrackingSameDay,
    incrementUserTrackingAnotherDay
};

export { IGetUnvalidatedInputsResult } from "./sql/queries.queries.js";