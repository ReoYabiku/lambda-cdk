import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from 'constructs';

export class LambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //HelloWorldするLambdaの作成
    const helloFunc = new lambda.Function(this, "HelloLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "hello.lambda_handler",
      code: lambda.Code.fromAsset('lambda', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_12.bundlingImage,
          command: [
            'bash',
            '-c',
            'cp -au . /asset-output'
          ],
        }
      })
    })

    // API Gateway RestAPIの作成
    const nameRestApi ="Rest API with Lambda auth";
    const restApi = new apigateway.RestApi(this, nameRestApi, {
      restApiName: `Rest_API_with_Lambda_auth`,
      deployOptions: {
        stageName: 'v1',
      },
    });

    //API Gatewayにリクエスト先のリソースを追加
    const restApiHelloWorld = restApi.root.addResource('hello_world');

    //リソースにGETメソッド、Lambda統合プロキシを指定
    restApiHelloWorld.addMethod(
      'GET',
      new apigateway.LambdaIntegration(helloFunc)
    );
  }
}
