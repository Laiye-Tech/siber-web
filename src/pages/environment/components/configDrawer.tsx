import React, { useState, useEffect, Fragment } from 'react'
import { Drawer, Button, Input, AutoComplete, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import styles from '../detail/index.less'

type Props = {
  setDrawerVisible: (visible: boolean) => void
  setConfigDetail: (config: any) => void
  config: any
  type: string
}

const DrawerForm: any = (props: Props) => {
  const [config, setConfig] = useState<any>(props.config)
  const { setDrawerVisible, setConfigDetail, type } = props

  const add = (env: string) => () => {
    config[env].key.push('')
    config[env].value.push('')
    setConfig({...config})
  }

  const handleKeyChange = (env: string, index: number) => (keyValue: any) => {
    const _config = JSON.parse(JSON.stringify(config));
    _config[env].key[index] = keyValue

    setConfig({..._config})
  }

  const handleValueChange = (env: string, index: number) => (e: any) => {
    const _config = JSON.parse(JSON.stringify(config));
    _config[env].value[index] = e.target.value

    setConfig({..._config})
  }

  const renderKeyInput = (env: string, key: string, index: number) => {
    const dataSource = [
      {value: 'pubkey'},
      {value: 'secret'}
    ]

    return (
      <AutoComplete
       placeholder='选择配置项'
       value={key}
       style={{width: '120px'}}
       options={dataSource}
       onChange={handleKeyChange(env, index)}
      />
    )
  }

  const deleteItem = (env: string, index: number) => () => {
    config[env].key.splice(index, 1)
    config[env].value.splice(index, 1)
    setConfig({...config})
  }

  const renderInput = (env: string) => {
    return config[env].key.map((item: any, index: number) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px'
        }}
        key={`input-${index}`}
      >
        {renderKeyInput(env, item, index)}
        <Input value={config[env].value[index]} onChange={handleValueChange(env, index)}/>
        <CloseOutlined style={{marginLeft: '8px', cursor: 'pointer'}} onClick={deleteItem(env, index)} />
      </div>
    ))
  }

  const renderAddConfig = (env: string) => {
    return (
      <Fragment>
        {renderInput(env)}
        <Button type="dashed" style={{width: '80%', display: 'block', margin: '10px auto'}} onClick={add(env)}>添加一项</Button>
      </Fragment>
    )
  }

  const handleNameChange = (e: any) => {
    setConfig({...config, name: e.target.value})
  }

  const handleOK = () => {
    if (!config.name) {
      message.error('配置名称必填')
      return false
    }

    if (config.name.indexOf('#') !== -1) {
      message.error('配置名称中不可含有非法字符"#"！');
      return false
    }

    setConfigDetail(config)
    setDrawerVisible(false)
  }

    return (
      <div className={styles.configDrawer}>
        <Drawer
          title={`${type === 'create' ? '新建' : '编辑'}应用配置`}
          width={500}
          onClose={() => setDrawerVisible(false)}
          visible={true}
          maskClosable={false}
          destroyOnClose={true}
          footer={
            <div
              style={{
                zIndex: 1,
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
              }}
            >
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleOK}>
             {type === 'create' ? '新建' : '保存'}
            </Button>
            </div>
          }
        >

         <h4>配置名称</h4>
         <Input value={config.name} onChange={handleNameChange} disabled={config.type !== 'create'}/>
         <h4 style={{marginTop: '20px'}}>开发配置</h4>
         {renderAddConfig('dev')}
         <h4>测试配置</h4>
         {renderAddConfig('test')}
         <h4>灰度配置</h4>
         {renderAddConfig('stage')}
         <h4>线上配置</h4>
         {renderAddConfig('prod')}
        </Drawer>
      </div>
    )
  }

export default DrawerForm
