
/**
 * 渲染 -请求头- 模块
 */
import React from 'react'

import JsonEditor from '@/components/JsonEditor';
import { ENV_REQUEST_TYPE } from '../../interface/index'

import styles from './index.less';

type Props = {
  handleJsonChange: (json: string) => void
  initeDate: string
  injectRequestBody: any
}

const RenderInjectCase = (props: Props) => {
  const { injectRequestBody } = props

  const handleEnvRequestChange = (env: string) => (json: any) => {
    injectRequestBody[env] = json
  }

  return (
    <div className={styles.container}>
      <h5>请求体配置：</h5>
        {
          Object.keys(ENV_REQUEST_TYPE).map(item => (
            <div style={{marginBottom: '20px'}}>
              <h6>{`${ENV_REQUEST_TYPE[item]}环境`}</h6>
              <JsonEditor
                height={100}
                id={`case-env-${item}`}
                onJsonChange={handleEnvRequestChange(item)}
                initeDate={`${injectRequestBody[item]}`}
              />
            </div>
          ))
        }
    </div>
  )
}

export default RenderInjectCase
