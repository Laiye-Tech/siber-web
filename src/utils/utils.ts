/**
 * @param breadNameList 当前页面包屑列表
 */
export const dispatchBreadCrumbs = (dispatch: any, breadNameList: string[])  => {
  if (dispatch) {
    dispatch({
      type: 'global/setPageBreadNameList',
      payload: breadNameList
    })
  }
}
