import axios from 'axios';

import uiHelper from 'helpers/uiHelper';

export default {
  get: httpGet,
  post: httpPost,
  patch: httpPatch,
  put: httpPut,
  delete: httpDelete,
};

function httpGet(url, queryParams = null) {
  const urlString = getUrl(url, queryParams);

  const axiosData = axios.get(urlString, getDefaultRequestOptions());

  return processRequest(axiosData);
}

function httpPost(url, data) {
  const request = axios.post(getUrl(url), JSON.stringify(data), getDefaultRequestOptions());

  return processRequest(request);
}

function httpPut(url, data) {
  const request = axios.put(getUrl(url), JSON.stringify(data), getDefaultRequestOptions());

  return processRequest(request);
}

function httpPatch(url, data) {
  const request = axios.patch(getUrl(url), JSON.stringify(data), getDefaultRequestOptions());

  return processRequest(request);
}

async function httpDelete(url) {
  const request = axios.delete(getUrl(url), getDefaultRequestOptions());

  return processRequest(request);
}

async function processRequest(axiosRequest) {
  try {
    const response = await axiosRequest;
    // if OK return
    if (response.status === 200) return response.data;

    const status = response.status;

    if (status === 401 || status === 403) {
      //TODO
    }

    if (status === 400 || status === 500) {
      const responseData = response.data;
      if (responseData && responseData.message) {
        throw new Error(responseData.message);
      }
    }

    throw new Error(`Invalid HTTP response status ${status}`);
  } catch (err) {
    let error: any = err;

    if (error.message === 'Network Error') {
      error = new Error('Network error occurs. Please check your VPN connection.');
    }
    uiHelper.showError(error);
  }
}

function getQueryString(params) {
  if (!params || !Object.keys(params).length) return '';

  const esc = encodeURIComponent;

  let query = '?';

  query += Object.keys(params)
    .map((k) => esc(k) + '=' + esc(params[k]))
    .join('&');

  return query;
}

function getDefaultRequestOptions() {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };
}

function getUrl(url, queryParams = null) {
  return `${url}${getQueryString(queryParams)}`;
}
