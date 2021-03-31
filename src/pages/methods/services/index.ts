import { post } from '@/services';
import { ManageMode } from '@/services/interface';
import {
  ServiceInfo,
  MethodDescribe,
  MethodInfo,
  PlanInfoList,
  QraphqlQueryInfo,
} from '../interface';

/**
 * method 列表接口【通过proto爬取】
 */
export async function methodsOnProto(protoFile: string, serviceName?: string[]) {
  const url = '/parse/methodlist';
  const requestBody = {
    service_name: serviceName,
    proto_file: protoFile,
  };

  return post<ServiceInfo>(url, requestBody);
}

/**
 * 方法描述接口
 */
export async function getMethodDescribe(methodName: string, protoFiles: string[]) {
  const url = '/describe/method';
  const requestBody = {
    method_name: methodName,
    proto_files: protoFiles,
  };

  return post<MethodDescribe>(url, requestBody);
}

/**
 * 定义method接口
 */
export async function createMethod(manageMode: ManageMode, methodInfo: MethodInfo) {
  const url = '/manage/method';
  const requestBody = {
    manage_mode: manageMode,
    method_info: methodInfo,
  };

  return post<MethodInfo>(url, requestBody);
}

/**
 * 查询 proto 列表
 */
export async function listProto() {
  const url = '/method/list/proto';
  const requestBody = {};

  return post<PlanInfoList>(url, requestBody);
}

/**
 * 获取graphql 接口列表信息
 */
export async function getQraphqlMethodList() {
  const url = '/method/list/graphql';
  const requestBody = {};

  return post<string[]>(url, requestBody);
}

/**
 * 获取graphql 接口query 详情
 */

export async function getQraphqlQueryInfo(methodName: string) {
  const url = '/graphql/query';
  const requestBody = { method_name: methodName };

  return post<QraphqlQueryInfo>(url, requestBody);
}
