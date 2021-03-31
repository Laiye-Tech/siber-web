import React, { useState, useEffect } from 'react'
import { Table, Button,  Card } from 'antd';

import DrawerForm from '../configDrawer'
import styles from './index.less';

type Props = {
  location: any;
  setConfigData: (config: any) => void
  configData: any
};

const configItem = {key: [''], value: ['']}
const configDefault = {
  name: '',
  dev: configItem,
  test: configItem,
  stage: configItem,
  prod: configItem
}

const SecretSetting: any = (props: Props) => {
  const [tableConfigData, setTableConfigData] = useState<any>([])

  const [configListItem, setConfigListItem] = useState<any>({})
  const [type, setType] = useState<string>('create')
  const [editIndex, setEditIndex] = useState<string>('create')
  const [toogleDrawerVisible, setDrawerVisible] = useState<boolean>(false)

  const { setConfigData, configData } = props

  useEffect(() => {
    formatConfigList();
   },[configData]);

  const setConfig = async (config: any) => {
    // 编辑不需要push
    if (type === 'create') {
      tableConfigData.push(config)
    } else {
      // 直接更改
      tableConfigData[editIndex] = config
    }

    await setTableConfigData([...tableConfigData])
    setConfigData(tableConfigData)
  }

  /**
   * 格式化成数组
   */
  const formatConfigList = () => {
    const _configDefault = JSON.parse(JSON.stringify(configDefault))

    if (configData) {
      const secret_list = configData.map(item => {
        const _item = JSON.parse(JSON.stringify(item))
        const dev = configDefault.dev ? JSON.parse(JSON.stringify(configDefault.dev)) : {}
        const test = configDefault.test ? JSON.parse(JSON.stringify(configDefault.test)) : {}
        const stage = configDefault.stage ? JSON.parse(JSON.stringify(configDefault.stage)) : {}
        const prod = configDefault.prod ? JSON.parse(JSON.stringify(configDefault.prod)) : {}

        _configDefault.name = _item.secret_name
        _configDefault.type = _item.type

        if (_item.secret_info) {

          dev.key =  _item.secret_info.dev_secret && Object.keys(_item.secret_info.dev_secret).length ? Object.keys(_item.secret_info.dev_secret) : ['']
          dev.value =   _item.secret_info.dev_secret && Object.keys(_item.secret_info.dev_secret).length ? Object.values(_item.secret_info.dev_secret) : ['']
          test.key =  _item.secret_info.test_secret && Object.keys(_item.secret_info.test_secret).length ? Object.keys(_item.secret_info.test_secret) : ['']
          test.value =  _item.secret_info.test_secret && Object.keys(_item.secret_info.test_secret).length ? Object.values(_item.secret_info.test_secret) : ['']

          stage.key =  _item.secret_info.stage_secret && Object.keys(_item.secret_info.stage_secret).length ? Object.keys(_item.secret_info.stage_secret) : ['']

          stage.value = _item.secret_info.stage_secret &&  Object.keys(_item.secret_info.stage_secret).length ? Object.values(_item.secret_info.stage_secret) : ['']

          prod.key = _item.secret_info.prod_secret &&  Object.keys(_item.secret_info.prod_secret).length ? Object.keys(_item.secret_info.prod_secret) : ['']

          prod.value =  _item.secret_info.prod_secret && Object.keys(_item.secret_info.prod_secret).length ? Object.values(_item.secret_info.prod_secret) : ['']

          _configDefault.dev = dev
          _configDefault.test = test
          _configDefault.stage = stage
          _configDefault.prod = prod
        }

        return JSON.parse(JSON.stringify(_configDefault))
      })

      setTableConfigData(secret_list)
    }
  }

  const handleConfigEdit = (data: any, type: string, index?: number) => async () => {
    const _data = JSON.parse(JSON.stringify(data))

    setType(type)

    if (type === 'edit') {
      setEditIndex(index)
    } else {
      _data.type = 'create'
    }

    await setConfigListItem(_data)
    setDrawerVisible(!toogleDrawerVisible)
  }

  const handleConfigDelete = (index: number) => async () => {
    tableConfigData.splice(index, 1)

    await setTableConfigData([...tableConfigData])
    setConfigData(tableConfigData)
  }

  const columns = [
    {
      title: '配置名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '操作',
      key: 'operator',
      render: (_, data, index) => (
        <div>
         <a onClick={handleConfigEdit(tableConfigData[index], 'edit', index)}>编辑</a>
         <a onClick={handleConfigDelete(index)} style={{marginLeft: '10px'}}>删除</a>
        </div>)
    }
  ]

	return (
    <div className={styles.container}>
      <Card title="应用配置：" bordered={false}>
        <Button type="primary" onClick={handleConfigEdit(configDefault, 'create')} style={{marginBottom: '20px'}}>
            新增配置
        </Button>
        <Table columns={columns} dataSource={tableConfigData} scroll={{y: '500px'}} pagination={false}/>
        {toogleDrawerVisible &&  <DrawerForm type={type} config={configListItem} setDrawerVisible={setDrawerVisible} setConfigDetail={setConfig}/>}
      </Card>
    </div>
	)
}

export default SecretSetting
