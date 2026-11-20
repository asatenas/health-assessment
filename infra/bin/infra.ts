#!/usr/bin/env node
import { App, type Stack } from 'aws-cdk-lib';
import { BaseStack } from '../lib/base-stack';
import { NetworkStack } from '../lib/network-stack';
import { RuntimeStack } from '../lib/runtime-stack';

/** The AWS project's selected Region; every stack is deployed here. */
const REGION = 'us-east-2';

/**
 * The account comes from the CDK CLI, which sets CDK_DEFAULT_ACCOUNT from
 * the credentials of `--profile`, so it is never committed to this (public)
 * repository.
 */
function resolveAccount(): string {
  const account = process.env.CDK_DEFAULT_ACCOUNT;
  if (!account) {
    throw new Error(
      'No AWS account resolved. Run cdk with --profile asatenas (e.g. `pnpm cdk:synth`) and make sure that profile is logged in.',
    );
  }
  return account;
}

const env = { account: resolveAccount(), region: REGION };
const app = new App();

const network = new NetworkStack(app, 'NetworkStack', {
  stackName: 'HealthAssessment-Network',
  env,
});
const base = new BaseStack(app, 'BaseStack', {
  stackName: 'HealthAssessment-Base',
  env,
});
new RuntimeStack(app, 'RuntimeStack', {
  stackName: 'HealthAssessment-Runtime',
  env,
  network,
  base,
});

// Synthesize first: dependencies created by cross-stack references are only
// added during synthesis, so checking before it misses them.
app.synth();

// Dependency rule: Runtime may depend on Network and Base, never the other
// way. Network and Base must not depend on any stack.
for (const stack of [network, base] as Stack[]) {
  if (stack.dependencies.length > 0) {
    const names = stack.dependencies.map((d) => d.node.id).join(', ');
    throw new Error(
      `${stack.node.id} must not depend on other stacks (depends on: ${names}).`,
    );
  }
}
