/**
 * Resource types that should be hidden in topology view.
 * Based on cdk-dia's TOPOLOGY_HIDDEN_TYPES.
 *
 * These are either:
 * - Low-level plumbing (routing, security groups)
 * - Represented structurally (VPC as boundary, subnets as zones)
 * - Supporting resources implied by main resources
 */
export const TOPOLOGY_HIDDEN_TYPES = new Set([
  // EC2 networking plumbing
  'AWS::EC2::Subnet',
  'AWS::EC2::RouteTable',
  'AWS::EC2::SubnetRouteTableAssociation',
  'AWS::EC2::Route',
  'AWS::EC2::EIP',
  'AWS::EC2::VPCGatewayAttachment',
  'AWS::EC2::NetworkAcl',
  'AWS::EC2::SubnetNetworkAclAssociation',
  'AWS::EC2::SecurityGroup',
  'AWS::EC2::SecurityGroupIngress',
  'AWS::EC2::SecurityGroupEgress',
  'AWS::EC2::VPC', // VPC shown as green box boundary, not as a node

  // RDS supporting resources (keep DBCluster, DBProxy, DBInstance visible)
  'AWS::RDS::DBSubnetGroup',
  'AWS::RDS::DBParameterGroup',
  'AWS::RDS::DBClusterParameterGroup',
  'AWS::RDS::DBProxyTargetGroup',

  // ECS supporting resources
  'AWS::ECS::ClusterCapacityProviderAssociations',
  'AWS::ECS::TaskDefinition',
  // NOTE: Keep ECS Service, ECS Cluster visible - they're architectural

  // ELB supporting resources
  'AWS::ElasticLoadBalancingV2::TargetGroup',
  'AWS::ElasticLoadBalancingV2::Listener',

  // ElastiCache supporting resources
  'AWS::ElastiCache::SubnetGroup',
  'AWS::ElastiCache::ParameterGroup',

  // IAM - keep Role visible for topology (shown outside VPC), hide others
  'AWS::IAM::Policy',
  'AWS::IAM::ManagedPolicy',
  'AWS::IAM::InstanceProfile',

  // Logging
  'AWS::Logs::LogGroup',

  // Secrets Manager supporting resources
  'AWS::SecretsManager::SecretTargetAttachment',
  'AWS::SecretsManager::RotationSchedule',

  // Auto-scaling
  'AWS::ApplicationAutoScaling::ScalableTarget',
  'AWS::ApplicationAutoScaling::ScalingPolicy',

  // Monitoring
  'AWS::CloudWatch::Alarm',
  'AWS::CloudWatch::Dashboard',
  'AWS::CloudWatch::CompositeAlarm',

  // Messaging
  'AWS::SNS::Topic',
  'AWS::SNS::Subscription',
  'AWS::SNS::TopicPolicy',

  // Parameter store
  'AWS::SSM::Parameter',
  'AWS::SSM::Association',

  // Lambda supporting resources
  'AWS::Lambda::Permission',

  // CDK Metadata
  'AWS::CDK::Metadata',
]);

/**
 * Apply topology-specific filters to hidden types.
 * When switching to topology view, automatically hide plumbing resources.
 */
export function applyTopologyFilter(
  currentHiddenTypes: Set<string>,
): Set<string> {
  const filtered = new Set(currentHiddenTypes);
  TOPOLOGY_HIDDEN_TYPES.forEach((type) => filtered.add(type));
  return filtered;
}

/**
 * Remove topology-specific filters.
 * When switching away from topology view, restore user's custom filters.
 */
export function removeTopologyFilter(
  currentHiddenTypes: Set<string>,
): Set<string> {
  const filtered = new Set(currentHiddenTypes);
  TOPOLOGY_HIDDEN_TYPES.forEach((type) => filtered.delete(type));
  return filtered;
}
