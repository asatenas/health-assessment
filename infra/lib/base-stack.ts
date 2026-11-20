import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

/**
 * Long-lived resources that must survive any change to the runtime.
 *
 * This is why Base is a separate stack: the Route 53 hosted zone (its
 * nameservers are registered at GoDaddy, so recreating it means changing
 * them there and waiting for DNS) and the ACM certificate (validated through
 * DNS in that zone) must never be deleted or replaced by a Runtime redeploy
 * or teardown. It also holds the other resources Runtime builds on, such as
 * the S3 buckets, the SQS queue and the ECR repository.
 *
 * Parameter Store SecureString values are NOT created here: CloudFormation
 * cannot create SecureString parameters, so they are created outside CDK
 * and the stacks only reference them by name.
 *
 * Must not depend on any other stack in this app.
 */
export class BaseStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
