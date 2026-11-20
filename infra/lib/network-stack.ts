import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

/**
 * Networking: VPC, subnets, security groups, S3 gateway endpoint.
 *
 * Must not depend on any other stack in this app.
 */
export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
  }
}
