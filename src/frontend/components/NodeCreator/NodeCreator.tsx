import React, {useState} from 'react';
import './NodeCreator.css';

// Common AWS resource types organized by category
const AWS_RESOURCE_TYPES = {
  'Compute': [
    'AWS::Lambda::Function',
    'AWS::EC2::Instance',
    'AWS::ECS::Service',
    'AWS::ECS::Cluster',
    'AWS::EKS::Cluster',
  ],
  'Storage': [
    'AWS::S3::Bucket',
    'AWS::EFS::FileSystem',
    'AWS::FSx::FileSystem',
  ],
  'Database': [
    'AWS::DynamoDB::Table',
    'AWS::RDS::DBInstance',
    'AWS::RDS::DBCluster',
    'AWS::ElastiCache::CacheCluster',
    'AWS::Neptune::DBCluster',
    'AWS::DocumentDB::DBCluster',
    'AWS::Redshift::Cluster',
  ],
  'Networking': [
    'AWS::EC2::VPC',
    'AWS::EC2::Subnet',
    'AWS::EC2::InternetGateway',
    'AWS::EC2::NatGateway',
    'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'AWS::ApiGateway::RestApi',
    'AWS::ApiGatewayV2::Api',
  ],
  'Messaging & Queue': [
    'AWS::SQS::Queue',
    'AWS::SNS::Topic',
    'AWS::Kinesis::Stream',
    'AWS::Events::Rule',
    'AWS::StepFunctions::StateMachine',
  ],
  'Security': [
    'AWS::IAM::Role',
    'AWS::SecretsManager::Secret',
    'AWS::KMS::Key',
    'AWS::CertificateManager::Certificate',
  ],
  'CDN': ['AWS::CloudFront::Distribution', 'AWS::Route53::HostedZone'],
  'Monitoring': ['AWS::CloudWatch::Alarm', 'AWS::Logs::LogGroup'],
  'Analytics': ['AWS::Glue::Database', 'AWS::Athena::WorkGroup'],
  'Developer Tools': [
    'AWS::CodeBuild::Project',
    'AWS::CodePipeline::Pipeline',
    'AWS::CodeDeploy::Application',
  ],
};

interface NodeCreatorProps {
  onCreateNode: (resourceType: string, label: string) => void;
  onClose: () => void;
}

export function NodeCreator({onCreateNode, onClose}: NodeCreatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [label, setLabel] = useState('');

  const handleCreate = () => {
    if (!selectedType || !label.trim()) {
      alert('Please select a resource type and enter a label.');
      return;
    }
    onCreateNode(selectedType, label.trim());
    onClose();
  };

  return (
    <div className="node-creator-overlay" onClick={onClose}>
      <div className="node-creator" onClick={(e) => e.stopPropagation()}>
        <div className="node-creator-header">
          <h3>➕ Add AWS Resource</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="node-creator-content">
          <div className="node-creator-step">
            <label>1. Select Category</label>
            <div className="category-grid">
              {Object.keys(AWS_RESOURCE_TYPES).map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedType(null);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="node-creator-step">
              <label>2. Select Resource Type</label>
              <div className="resource-type-list">
                {AWS_RESOURCE_TYPES[
                  selectedCategory as keyof typeof AWS_RESOURCE_TYPES
                ].map((type) => (
                  <button
                    key={type}
                    className={`resource-type-button ${selectedType === type ? 'selected' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type.replace('AWS::', '').replace(/::/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedType && (
            <div className="node-creator-step">
              <label htmlFor="node-label">3. Enter Label</label>
              <input
                id="node-label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., UserLambda, MainBucket, UsersTable"
                maxLength={50}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="node-creator-actions">
          <button
            className="create-button"
            onClick={handleCreate}
            disabled={!selectedType || !label.trim()}
          >
            Add Resource
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
