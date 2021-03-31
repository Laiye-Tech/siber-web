const { lookup } = require('mime-types');
const uuid = require('uuid');
const { config } = require('../config');

// @ts-ignore
const AWS = require('aws-sdk');

const isPvt = config.mode === 'pvt';

AWS.config.setPromisesDependency(Promise);

AWS.config.update({
  signatureVersion: 'v4',
  httpOptions: {
    timeout: 6000,
  },
});

/**
 * 创建 AWS Client
 */
function createAwsClient() {
  const {
    oss: { accessKey, accessSecret: secretAccessKey, endpoint, bucket, region },
  } = config;
  const options = {
    accessKeyId: accessKey,
    secretAccessKey,
    endpoint,
    // @ts-ignore
    bucket,
    s3ForcePathStyle: isPvt,
  };

  if (!isPvt) {
    options.region = region;
  }

  const client = new AWS.S3(options);
  return client;
}

/**
 * 使用 AWS SDK 上传文件，可以同时支持阿里云 OSS 和 minio
 * @param fileName
 * @param file
 */
const uploadByAwsSDK = async (fileName, file) => {
  try {
    const {
      oss: { bucket },
    } = config;
    const ext = fileName.split('.').pop();
    const filename = `${uuid.v4()}.${ext}`;

    const client = createAwsClient();

    const options = {
      Bucket: bucket,
      Key: filename,
      Body: file,
    };

    const contentType = lookup(filename);

    if (contentType) {
      options.ContentType = contentType;
    }

    const { Location } = await client.upload(options).promise();
    return Location;
  } catch (error) {
    console.log('error===', error);
    throw new Error(`上传文件失败`);
  }
};

module.exports = uploadByAwsSDK;
