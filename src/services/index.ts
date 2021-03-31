import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AxiosResult } from './interface';

const MODE = window.config.mode;

axios.defaults.headers = {
  'Content-Type': 'application/json',
};

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

export async function post<T>(url: string, requestBody: any, headers?: any, type?: string) {
  // 如果是使用的本项目的服务端接口
  if (type && type === 'server') {
    axios.defaults.baseURL = '';
  } else {
    axios.defaults.baseURL =
      MODE === 'dev' ? `${window.config.apiHost.http}/siberhttp` : '/siberhttp';
  }

  const options: AxiosRequestConfig = {
    url,
    data: requestBody,
    method: 'POST',
    headers,
  };

  let result: AxiosResult<T> = {
    success: false,
    code: 0,
    errmsg: '',
    data: null,
  };
  try {
    const { status, data } = await axios(options);
    result.success = true;
    result.code = status;
    result.data = data;
  } catch (error) {
    result.success = false;
    result.errmsg = error.message;

    if (error.response) {
      result.code = error.response.data.code;
      result.errmsg = error.response.data.message;
      result.details = error.response.data.details;
    }
  }

  return result;
}
