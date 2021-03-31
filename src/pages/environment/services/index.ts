import { post } from '@/services';

import { ManageMode } from '@/services/interface';

import {
    EnvList,
    EnvInfo,
    FilterInfo
} from '../interface';

/**
 * 查询 env 列表
 */
export async function listEnv(filterInfo: FilterInfo) {
  const url = '/list/env';
  const requestBody = filterInfo;
  return post<EnvList>(url, requestBody);
}

/**
 * 单独操作一个 env interface
 */
export async function manageEnv(manageMode: ManageMode, envInfo: EnvInfo) {
  const url = '/manage/env';
  const requestBody = {
    manage_mode: manageMode,
    env_info: envInfo,
  };

  return post<EnvInfo>(url, requestBody);
}

