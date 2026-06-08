/**
 * Maps CloudFormation resource types to AWS icon paths.
 */

const ICON_SIZE = 32;
const ICON_BASE_PATH = '/assets/aws-icons';

/**
 * Mapping of CloudFormation resource types to AWS service icon paths.
 * Icons are in the Architecture-Service-Icons directory.
 */
const RESOURCE_TYPE_TO_ICON: Record<string, string> = {
  // Compute
  'AWS::Lambda::Function': `Arch_Compute/${ICON_SIZE}/Arch_AWS-Lambda_${ICON_SIZE}.svg`,
  'AWS::EC2::Instance': `Arch_Compute/${ICON_SIZE}/Arch_Amazon-EC2_${ICON_SIZE}.svg`,
  'AWS::ECS::Service': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Container-Service_${ICON_SIZE}.svg`,
  'AWS::ECS::TaskDefinition': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Container-Service_${ICON_SIZE}.svg`,
  'AWS::ECS::Cluster': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Container-Service_${ICON_SIZE}.svg`,
  'AWS::EKS::Cluster': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Kubernetes-Service_${ICON_SIZE}.svg`,
  'AWS::Batch::JobDefinition': `Arch_Compute/${ICON_SIZE}/Arch_AWS-Batch_${ICON_SIZE}.svg`,

  // Storage
  'AWS::S3::Bucket': `Arch_Storage/${ICON_SIZE}/Arch_Amazon-Simple-Storage-Service_${ICON_SIZE}.svg`,
  'AWS::EFS::FileSystem': `Arch_Storage/${ICON_SIZE}/Arch_Amazon-Elastic-File-System_${ICON_SIZE}.svg`,
  'AWS::FSx::FileSystem': `Arch_Storage/${ICON_SIZE}/Arch_Amazon-FSx_${ICON_SIZE}.svg`,

  // Database
  'AWS::RDS::DBInstance': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::RDS::DBCluster': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-Aurora_${ICON_SIZE}.svg`,
  'AWS::RDS::DBSubnetGroup': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::RDS::DBClusterParameterGroup': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::RDS::DBParameterGroup': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::RDS::DBProxy': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::RDS::DBProxyTargetGroup': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-RDS_${ICON_SIZE}.svg`,
  'AWS::DynamoDB::Table': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-DynamoDB_${ICON_SIZE}.svg`,
  'AWS::ElastiCache::CacheCluster': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-ElastiCache_${ICON_SIZE}.svg`,
  'AWS::ElastiCache::ReplicationGroup': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-ElastiCache_${ICON_SIZE}.svg`,
  'AWS::Neptune::DBCluster': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-Neptune_${ICON_SIZE}.svg`,
  'AWS::DocumentDB::DBCluster': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-DocumentDB_${ICON_SIZE}.svg`,
  'AWS::Redshift::Cluster': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-Redshift_${ICON_SIZE}.svg`,
  'AWS::Timestream::Database': `Arch_Databases/${ICON_SIZE}/Arch_Amazon-Timestream_${ICON_SIZE}.svg`,

  // Networking
  'AWS::EC2::VPC': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::Subnet': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::InternetGateway': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::NatGateway': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::RouteTable': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::SecurityGroup': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Security-Hub_${ICON_SIZE}.svg`,
  'AWS::ElasticLoadBalancingV2::LoadBalancer': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Elastic-Load-Balancing_${ICON_SIZE}.svg`,
  'AWS::ElasticLoadBalancingV2::TargetGroup': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Elastic-Load-Balancing_${ICON_SIZE}.svg`,
  'AWS::CloudFront::Distribution': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-CloudFront_${ICON_SIZE}.svg`,
  'AWS::Route53::HostedZone': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Route-53_${ICON_SIZE}.svg`,
  'AWS::Route53::RecordSet': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Route-53_${ICON_SIZE}.svg`,
  'AWS::ApiGateway::RestApi': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-API-Gateway_${ICON_SIZE}.svg`,
  'AWS::ApiGatewayV2::Api': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-API-Gateway_${ICON_SIZE}.svg`,

  // Messaging & Integration
  'AWS::SQS::Queue': `Arch_App-Integration/${ICON_SIZE}/Arch_Amazon-Simple-Queue-Service_${ICON_SIZE}.svg`,
  'AWS::SNS::Topic': `Arch_App-Integration/${ICON_SIZE}/Arch_Amazon-Simple-Notification-Service_${ICON_SIZE}.svg`,
  'AWS::Events::Rule': `Arch_App-Integration/${ICON_SIZE}/Arch_Amazon-EventBridge_${ICON_SIZE}.svg`,
  'AWS::Kinesis::Stream': `Arch_Analytics/${ICON_SIZE}/Arch_Amazon-Kinesis_${ICON_SIZE}.svg`,
  'AWS::StepFunctions::StateMachine': `Arch_App-Integration/${ICON_SIZE}/Arch_AWS-Step-Functions_${ICON_SIZE}.svg`,

  // Security & IAM
  'AWS::IAM::Role': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,
  'AWS::IAM::Policy': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,
  'AWS::IAM::User': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,
  'AWS::SecretsManager::Secret': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Secrets-Manager_${ICON_SIZE}.svg`,
  'AWS::KMS::Key': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Key-Management-Service_${ICON_SIZE}.svg`,
  'AWS::CertificateManager::Certificate': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Certificate-Manager_${ICON_SIZE}.svg`,

  // Monitoring & Management
  'AWS::CloudWatch::Alarm': `Arch_Management-Tools/${ICON_SIZE}/Arch_Amazon-CloudWatch_${ICON_SIZE}.svg`,
  'AWS::Logs::LogGroup': `Arch_Management-Tools/${ICON_SIZE}/Arch_Amazon-CloudWatch_${ICON_SIZE}.svg`,
  'AWS::CloudFormation::Stack': `Arch_Management-Tools/${ICON_SIZE}/Arch_AWS-CloudFormation_${ICON_SIZE}.svg`,

  // Analytics
  'AWS::Glue::Database': `Arch_Analytics/${ICON_SIZE}/Arch_AWS-Glue_${ICON_SIZE}.svg`,
  'AWS::Glue::Table': `Arch_Analytics/${ICON_SIZE}/Arch_AWS-Glue_${ICON_SIZE}.svg`,
  'AWS::Athena::WorkGroup': `Arch_Analytics/${ICON_SIZE}/Arch_Amazon-Athena_${ICON_SIZE}.svg`,

  // Developer Tools
  'AWS::CodeBuild::Project': `Arch_Developer-Tools/${ICON_SIZE}/Arch_AWS-CodeBuild_${ICON_SIZE}.svg`,
  'AWS::CodePipeline::Pipeline': `Arch_Developer-Tools/${ICON_SIZE}/Arch_AWS-CodePipeline_${ICON_SIZE}.svg`,
  'AWS::CodeDeploy::Application': `Arch_Developer-Tools/${ICON_SIZE}/Arch_AWS-CodeDeploy_${ICON_SIZE}.svg`,
  'AWS::CodeCommit::Repository': `Arch_Developer-Tools/${ICON_SIZE}/Arch_AWS-CodeCommit_${ICON_SIZE}.svg`,

  // Additional Compute
  'AWS::AutoScaling::AutoScalingGroup': `Arch_Compute/${ICON_SIZE}/Arch_Amazon-EC2_${ICON_SIZE}.svg`,
  'AWS::AutoScaling::LaunchConfiguration': `Arch_Compute/${ICON_SIZE}/Arch_Amazon-EC2_${ICON_SIZE}.svg`,
  'AWS::EC2::LaunchTemplate': `Arch_Compute/${ICON_SIZE}/Arch_Amazon-EC2_${ICON_SIZE}.svg`,

  // Additional Networking
  'AWS::EC2::EIP': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::EIPAssociation': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::VPCEndpoint': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::VPCGatewayAttachment': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::VPCPeeringConnection': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::NetworkAcl': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,
  'AWS::EC2::NetworkAclEntry': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Amazon-Virtual-Private-Cloud_${ICON_SIZE}.svg`,

  // CloudWatch
  'AWS::CloudWatch::Dashboard': `Arch_Management-Tools/${ICON_SIZE}/Arch_Amazon-CloudWatch_${ICON_SIZE}.svg`,
  'AWS::CloudWatch::MetricFilter': `Arch_Management-Tools/${ICON_SIZE}/Arch_Amazon-CloudWatch_${ICON_SIZE}.svg`,

  // SNS/SQS
  'AWS::SNS::Subscription': `Arch_Application-Integration/${ICON_SIZE}/Arch_Amazon-Simple-Notification-Service_${ICON_SIZE}.svg`,
  'AWS::SQS::QueuePolicy': `Arch_Application-Integration/${ICON_SIZE}/Arch_Amazon-Simple-Queue-Service_${ICON_SIZE}.svg`,

  // Additional Security
  'AWS::IAM::InstanceProfile': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,
  'AWS::IAM::Group': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,
  'AWS::IAM::ManagedPolicy': `Arch_Security-Identity/${ICON_SIZE}/Arch_AWS-Identity-and-Access-Management_${ICON_SIZE}.svg`,

  // Additional EKS/ECR
  'AWS::EKS::Nodegroup': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Kubernetes-Service_${ICON_SIZE}.svg`,
  'AWS::ECR::Repository': `Arch_Containers/${ICON_SIZE}/Arch_Amazon-Elastic-Container-Registry_${ICON_SIZE}.svg`,

  // ElasticLoadBalancing
  'AWS::ElasticLoadBalancing::LoadBalancer': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Elastic-Load-Balancing_${ICON_SIZE}.svg`,
  'AWS::ElasticLoadBalancingV2::Listener': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Elastic-Load-Balancing_${ICON_SIZE}.svg`,
  'AWS::ElasticLoadBalancingV2::ListenerRule': `Arch_Networking-Content-Delivery/${ICON_SIZE}/Arch_Elastic-Load-Balancing_${ICON_SIZE}.svg`,
};

/**
 * Default icon for unknown resource types.
 */
const DEFAULT_ICON = `Arch_Management-Tools/${ICON_SIZE}/Arch_AWS-CloudFormation_${ICON_SIZE}.svg`;

/**
 * Get the icon path for a CloudFormation resource type.
 *
 * @param resourceType - CloudFormation resource type (e.g., AWS::Lambda::Function)
 * @returns Relative path to the icon file
 */
export function getIconPath(resourceType: string): string {
  const iconPath = RESOURCE_TYPE_TO_ICON[resourceType] ?? DEFAULT_ICON;
  return `${ICON_BASE_PATH}/Architecture-Service-Icons_04302026/${iconPath}`;
}

/**
 * Get all supported resource types.
 *
 * @returns Array of supported CloudFormation resource types
 */
export function getSupportedResourceTypes(): string[] {
  return Object.keys(RESOURCE_TYPE_TO_ICON);
}

/**
 * Check if a resource type has a custom icon.
 *
 * @param resourceType - CloudFormation resource type
 * @returns True if a custom icon exists
 */
export function hasCustomIcon(resourceType: string): boolean {
  return resourceType in RESOURCE_TYPE_TO_ICON;
}
