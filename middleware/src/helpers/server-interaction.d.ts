import { FailedResult, SuccessfulResult } from "../types";
export declare function backendEndpointCall<T>(query: string): Promise<SuccessfulResult<T> | FailedResult>;
export declare function backendTextEndpointCall(query: string): Promise<SuccessfulResult<string> | FailedResult>;
export declare function indexerEndpointCall<T>(query: string): Promise<SuccessfulResult<T> | FailedResult>;
export declare function batcherEndpointCall<T>(query: string): Promise<SuccessfulResult<T> | FailedResult>;
export declare function postToBatcher<T>(query: string, data: string): Promise<SuccessfulResult<T> | FailedResult>;
