  export interface GlobalType {
    roterHistoryList: any
    currentPageBreadNameList: string[]
  }

  export default {
    namespace: 'global',

    state: {
      // 历史路由列表\每一次路由变化时、将其push进去
      roterHistoryList: [],
      // 面包屑名称
      // 当前页面所有层级
      currentPageBreadNameList: []
    },

    reducers: {
      setRoterHistoryList(state: any, { payload }: any) {
        // 修改roterHistoryList
        const _roterHistoryList = state.roterHistoryList.concat([payload])

        return { ...state, roterHistoryList: _roterHistoryList, currentPageBreadNameList: []}
      },

      setPageBreadNameList(state: any, { payload }: any) {
        return { ...state, currentPageBreadNameList: payload }
      }
    }
  }
