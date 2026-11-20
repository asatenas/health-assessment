import { Stack, type StackProps, aws_ec2 as ec2 } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

/** ADR-003: two Availability Zones, named explicitly (no AZ lookup). */
const AVAILABILITY_ZONES = ['us-east-2a', 'us-east-2b'];

/**
 * ADR-003 private subnet ranges, in AZ order. CDK's Vpc numbers subnets
 * sequentially (it would pick 10.0.2.0/24 and 10.0.3.0/24), so these are set
 * on the underlying CloudFormation subnets below.
 */
const PRIVATE_SUBNET_CIDRS = ['10.0.10.0/24', '10.0.11.0/24'];

const APP_PORT = 3000;
const POSTGRES_PORT = 5432;

/**
 * Networking (ADR-003): VPC with public and isolated subnets in two AZs,
 * no NAT gateway, an S3 gateway endpoint, and one security group per layer.
 *
 * - Public subnets 10.0.0.0/24, 10.0.1.0/24: ALB and the Fargate task
 *   (public IP; outbound internet through the internet gateway).
 * - Private isolated subnets 10.0.10.0/24, 10.0.11.0/24: RDS. No internet
 *   route in either direction.
 *
 * Each security group only accepts traffic from the layer in front of it:
 * internet -> AlbSg (443, 80) -> AppSg (3000) -> DbSg (5432).
 *
 * Must not depend on any other stack in this app.
 */
export class NetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;
  /** ALB: 443 and 80 from anywhere; can only reach the app on 3000. */
  public readonly albSg: ec2.SecurityGroup;
  /** Fargate task: 3000 only from the ALB; outbound internet allowed. */
  public readonly appSg: ec2.SecurityGroup;
  /** RDS: 5432 only from the app; no outbound traffic. */
  public readonly dbSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      availabilityZones: AVAILABILITY_ZONES,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Escape hatch: give the isolated subnets the ADR-003 ranges.
    this.vpc.isolatedSubnets.forEach((subnet, i) => {
      const cfnSubnet = subnet.node.defaultChild as ec2.CfnSubnet;
      cfnSubnet.cidrBlock = PRIVATE_SUBNET_CIDRS[i];
    });

    // Free. Routes S3 traffic from every subnet through the VPC endpoint;
    // the profile-photos bucket policy only accepts requests that use it
    // (ADR-005). Public subnets need it too: the task runs there.
    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [
        { subnetType: ec2.SubnetType.PUBLIC },
        { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });

    this.albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc: this.vpc,
      description: 'ALB: HTTPS and HTTP (redirect) from the internet',
      allowAllOutbound: false,
    });
    this.albSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'HTTPS from anywhere',
    );
    this.albSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'HTTP from anywhere (redirected to 443)',
    );

    this.appSg = new ec2.SecurityGroup(this, 'AppSg', {
      vpc: this.vpc,
      description: 'Fargate task: app port from the ALB only',
      // The task needs outbound internet: AI Gateway, ECR, SQS, Parameter Store.
      allowAllOutbound: true,
    });
    this.appSg.addIngressRule(
      this.albSg,
      ec2.Port.tcp(APP_PORT),
      'App port from the ALB only',
    );
    this.albSg.addEgressRule(
      this.appSg,
      ec2.Port.tcp(APP_PORT),
      'To the app only',
    );

    this.dbSg = new ec2.SecurityGroup(this, 'DbSg', {
      vpc: this.vpc,
      description: 'RDS: Postgres from the app only',
      allowAllOutbound: false,
    });
    this.dbSg.addIngressRule(
      this.appSg,
      ec2.Port.tcp(POSTGRES_PORT),
      'Postgres from the app only',
    );
  }
}
