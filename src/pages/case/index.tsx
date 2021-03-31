import React, { useState, useEffect } from 'react'
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import { connect } from 'dva'
import moment from 'moment';

import { Button, Table, Card, message, Modal, Input, Dropdown, Menu, Spin, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { listCase, manageCase } from './services';
import { ManageMode } from '@/services/interface';
import { ConnectState } from '@/model/connect'
import { CaseInfo } from './interface';

import styles from './index.less';

const { confirm } = Modal;
const { Search } = Input;
const { Item } = Menu

const setDefaultvalue = (props: any) => {
  const { roterHistoryList }: any = props
    if (roterHistoryList) {
      const length = roterHistoryList.length
      const history = roterHistoryList[length - 2]
      // 如果前一步是编辑
      if (history && history.pathname === '/case/detail' && history.query.caseId) {
        return true
      }

     return false
  }
}

const Case: React.FC = (props: any) => {
  const isSetsetDefaultvalue = setDefaultvalue(props)
  let defaultvalue = isSetsetDefaultvalue ? window.sessionStorage.getItem('caseSerchValue') : ''
  const pageSize = 20;

  const [current, setCurrent] = useState<number>(1)
  const [img, setImg] = useState<any>(null)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [caseList, setCaseList] = useState<CaseInfo[]>([])
  const [searchValue, setSearchValue] = useState<string>(defaultvalue)

  useEffect (() => {
    !isSetsetDefaultvalue && window.sessionStorage.removeItem('caseSerchValue')
  },[]);

  useEffect(() => {
    getCaseList()
  },[current, searchValue])

  /**
  * 获取case列表
  */
  const getCaseList = async () => {
    const params = {content: searchValue, page: `${current}`, page_size: `${pageSize}`}
    const { success, data, errmsg }: any = await listCase({'filter_content': params});

    if (!success) {
      message.error(errmsg);
      setLoading(false)
      return false
    }
    setLoading(false)

    setTotalPage(data ? data.total_num : null)
    setCaseList(data && data.case_info_list ? [...data.case_info_list] : [])
  }

  /**
  * 编辑跳转到详情页
  */
  const jumpPabge = (modeType: string, data?: any) => () => {
    const queryParam: any = {
    modeType: modeType
    }
    if (data) {
      queryParam.caseId = data.case_id
    }

    router.push({
      pathname: '/case/detail',
      query: queryParam
    });
  };

  /**
  * 弹出删除框
  */
  const showConfirm = (caseId: string, name: string) => {
    confirm({
      title: '确认删除',
      content: `确认删除 ${name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleCaseDelete(caseId)
    });
  };

  const menu = (
    <Menu>
      <Item key="Interface" onClick={jumpPabge('interface')}>Interface</Item>
      <Item key="Instance" onClick={jumpPabge('instance')}>Instance</Item>
      <Item key="Instance" onClick={jumpPabge('inject')}>inject</Item>
    </Menu>
  );

  /**
  * 删除case
  */
  const handleCaseDelete = async (caseId: string) => {
    const params = {
      case_id: caseId,
    };

    const { success, errmsg }: any = await manageCase(ManageMode.DELETE, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }
    message.success('删除成功');

    getCaseList();
  };

  /**
  * 搜索case
  */
  const handleSearchClick = (value: string) => {
    window.sessionStorage.setItem('caseSerchValue', value)
    setCurrent(1)
    setSearchValue(value)
  }

  const handlePageChange = (page: number) => {
    setCurrent(page)
  }

  /**
  * 复制版本
  */
  const copyCase = (caseData: any) => async () => {
    const params = {
      case_id: caseData.case_id
    }

    const { errmsg, data }: any = await manageCase(ManageMode['DUPLICATE'], params)
    if (!data) {
      message.error(errmsg)
      return false
    }

    message.success(`${caseData.case_name}成功复制为${data.case_name}`)
    setCurrent(1)
    getCaseList()
  }

  const renderOperation= (data: any) => (
    <div className={styles.operation}>
      <span onClick={jumpPabge(data.case_mode, data)}>编辑</span>
      <span onClick={copyCase(data)}>复制</span>
      <span onClick={() => showConfirm(data.case_id, data.case_name)}>删除</span>
    </div>
  );

  const handleSetShowTootip = (id: any) => {
    const ele = document.getElementById(`case-name-${id}`)
    return ele && ele.scrollWidth > ele.clientWidth ? true : false
  }

  /**
  * case列表模块
  */
  const CaseTable: React.FC = () => {
  const columns = [
    {
      title: 'case名称',
      dataIndex: 'case_name',
      key: 'case_name',
      width: '35%',
      render: (case_name: string, data: any) => (
        <Tooltip title={handleSetShowTootip(data.case_id) ? case_name : null}>
          <div
            className={styles.caseNameSpan}
            id={`case-name-${data.case_id}`}
          >
            {case_name}
          </div>
        </Tooltip>
      )
    },
  {
    title: '接口类型',
    dataIndex: 'case_mode',
    key: 'case_mode',
    width: '20%'
  },
  {
    title: '更新时间',
    dataIndex: 'update_time',
    key: 'update_time',
    width: '25%',
    sorter: (a: any, b: any) => a.update_time - b.update_time,
    defaultSortOrder: 'descend',
    render: (update_time: number) => (
      <span>{update_time ? moment.unix(update_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'case_id',
    key: 'case_id',
    render: (_: string, data: any) => renderOperation(data),
  },
  ];
  return (
    <Spin spinning={loading}>
      <Table
        dataSource={caseList}
        // 加上这句width才起作用
        tableLayout="fixed"
        columns={columns}
        rowKey="case_id"
        pagination={{
          current: current,
          pageSize: pageSize,
          onChange: handlePageChange,
          total: totalPage,
          hideOnSinglePage: true,
        }}
      />
     </Spin>
    )
  }

    return (
      <div className={styles.container}>
        <Card>
          <header>
            <Search
              placeholder="搜索case"
              defaultValue={defaultvalue}
              onSearch={handleSearchClick}
              style={{ width: 300, marginRight: '20px'}}
            />
            <Dropdown overlay={menu}>
            <Button type='primary'>
            创建case <DownOutlined />
            </Button>
            </Dropdown>

          </header>
          <section>
          <CaseTable />
          </section>
        </Card>
      </div>
    )
  }

  const mapStateToProps = ({global}: ConnectState) => {
    return {
      roterHistoryList: global.roterHistoryList
    };
  }

  export default withRouter(connect(mapStateToProps)(Case))
