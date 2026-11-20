import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { BaseStack } from './base-stack';
import type { NetworkStack } from './network-stack';

export interface RuntimeStackProps extends StackProps {
  readonly network: NetworkStack;
  readonly base: BaseStack;
}

/**
 * What runs the app: ECS Fargate service, load balancer, and the Lambda that
 * sends the interview-finished email.
 *
 * May depend on NetworkStack and BaseStack; they must never depend on this one.
 */
export class RuntimeStack extends Stack {
  constructor(scope: Construct, id: string, props: RuntimeStackProps) {
    super(scope, id, props);

    // Deploy order is Network and Base before Runtime, even before any
    // resources are shared between them.
    this.addStackDependency(props.network);
    this.addStackDependency(props.base);
  }
}
