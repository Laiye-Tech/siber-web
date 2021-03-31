import { post } from '@/services';
import { ManageMode, FilterInfo, EnvRequest } from '@/services/interface';
import { CaseInfo, CaseInfoList, MethodInfoList, RunCaseRequest, MethodDescribe, MethodInfo, CaseVersion, CaseTagInfoList} from '../interface';
import { CaseLog } from '../../plan/interface'

/**
 * 查询 method 列表
 */
export async function listMethod(filterInfo: FilterInfo) {
  const url = '/list/method';
  const requestBody = filterInfo;

  return post<MethodInfoList>(url, requestBody);
}

/**
 * 查询 case 列表
 */
export async function listCase(filterInfo: FilterInfo) {
  const url = '/list/case';
  const requestBody = filterInfo;

  return post<CaseInfoList>(url, requestBody);
}

/**
 * 操作单个 case
 */
export async function manageCase(manageMode: ManageMode, caseInfo: CaseInfo) {
  const url = '/manage/case';
  const requestBody = {
    manage_mode: manageMode,
    case_info: caseInfo,
  };

  return post<CaseInfo>(url, requestBody);
}

/**
 * 运行单个 case
 */
export async function runCase(runCaseRequest: RunCaseRequest) {
  const url = '/run/case';
  const requestBody = runCaseRequest

  return post<CaseLog>(url, requestBody);
}

/**
 * request 描述接口
 */
export async function describeRequest(methodName: string) {
  const url = '/describe/request';
  const requestBody = {
    method_name: methodName
  }

  return post<MethodDescribe>(url, requestBody);
}

/**
 * 定义/查询/修改/删除 case version接口
 */
export async function manageCaseVersion(manageMode: ManageMode, caseInfo: CaseVersion) {
  const url = '/manage/case/version';
  const requestBody = {
    manage_mode: manageMode,
    case_version: caseInfo,
  };

  return post<CaseVersion>(url, requestBody);
}

/**
 * 查询case中的env列表
 */
export async function caseEnvList(filterContent: EnvRequest) {
  const url = '/list/env';
  const requestBody = {
    filter_content: filterContent
  };

  return post<CaseVersion>(url, requestBody);
}

/**
 * 查询单个case 的标签列表
 */
export async function caseTagList(filterInfo: FilterInfo) {
  const url = '/list/tag';
  const requestBody = filterInfo;;

  return post<CaseTagInfoList>(url, requestBody);
}

// 上传
export async function upload(formData: any) {
  const url = '/upload';

  const requestBody = formData

  return post<CaseTagInfoList>(url, requestBody, {
    'Content-Type': 'multipart/form-data'
  }, 'server');
}
