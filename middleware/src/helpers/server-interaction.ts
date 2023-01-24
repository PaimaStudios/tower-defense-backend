import { getBackendUri, getBatcherUri, getIndexerUri } from '../state';
import { FailedResult, SuccessfulResult } from '../types';

const toJson = (res: Response): Promise<any> => res.json();
const toText = (res: Response): Promise<string> => res.text();

async function endpointCall<T>(
  uri: string,
  toFxn: (res: Response) => Promise<T>
): Promise<SuccessfulResult<T> | FailedResult> {
  try {
    const j = await fetch(uri).then(toFxn);
    return {
      success: true,
      result: j,
    };
  } catch (err) {
    console.log(`[endpointCall] error while calling uri ${uri}:`, err);
    return {
      success: false,
      message: '',
    };
  }
}

const jsonEndpointCall = (uri: string) => endpointCall(uri, toJson);
const textEndpointCall = (uri: string) => endpointCall(uri, toText);

export async function backendEndpointCall<T>(
  query: string
): Promise<SuccessfulResult<T> | FailedResult> {
  const uri = `${getBackendUri()}/${query}`;
  return jsonEndpointCall(uri);
}

export async function backendTextEndpointCall(
  query: string
): Promise<SuccessfulResult<string> | FailedResult> {
  const uri = `${getBackendUri()}/${query}`;
  return textEndpointCall(uri);
}

export async function indexerEndpointCall<T>(
  query: string
): Promise<SuccessfulResult<T> | FailedResult> {
  const uri = `${getIndexerUri()}/${query}`;
  return jsonEndpointCall(uri);
}

export async function batcherEndpointCall<T>(
  query: string
): Promise<SuccessfulResult<T> | FailedResult> {
  const uri = `${getBatcherUri()}/${query}`;
  return jsonEndpointCall(uri);
}

async function postToEndpoint<T>(
  uri: string,
  data: string
): Promise<SuccessfulResult<T> | FailedResult> {
  try {
    const j = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: data,
    }).then(res => res.json());
    return {
      success: true,
      result: j,
    };
  } catch (err) {
    console.log(`[postToEndpoint] error while posting data: ${data}`);
    console.log(`[postToEndpoint] ...to uri ${uri}:`, err);
    return {
      success: false,
      message: '',
    };
  }
}

export async function postToBatcher<T>(
  query: string,
  data: string
): Promise<SuccessfulResult<T> | FailedResult> {
  const uri = `${getBatcherUri()}/${query}`;
  return postToEndpoint(uri, data);
}
