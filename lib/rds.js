import cf from '@openaddresses/cloudfriend';
import dashboard from './rds-dashboard.js';

/**
 * Provide CloudFormation Based Metrics, Alarms, & Dashboards ECS backed ELBs
 *
 * @param {Object} opts options object
 * @param {string}        opts.prefix Cloudformation Prefix
 * @param {string}        opts.email Email to submit alarms to
 * @param {string|Object} opts.instance ARN or CF Ref/ATT of RDS Instance
 * @param {Boolean}       [opts.dashboard=true] Is a dashboard created
 *
 * @returns {Object} CloudFormation Fragment with alarm Resources
 */
export default function RDS(opts = {}) {
    if (!opts.prefix) opts.prefix = '';
    if (!opts.dashboard) opts.dashboard = true;

    const Resources = {};

    Resources[`${opts.prefix}AlarmTopic`] = {
        Type: 'AWS::SNS::Topic',
        Properties: {
            TopicName: cf.join('-', [cf.stackName, 'topic']),
            Subscription: [{
                Endpoint: opts.email,
                Protocol: 'email'
            }]
        }
    };

    Resources[`${opts.prefix}DBCpuAlarm`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'DBCPUUtilization', cf.region]),
            Namespace: 'AWS/RDS',
            MetricName: 'CPUUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'DBInstanceIdentifier',
                Value: opts.instance
            }]
        }
    };

    Resources[`${opts.prefix}DBFreeStorage`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'DBFreeStorage', cf.region]),
            Namespace: 'AWS/RDS',
            MetricName: 'FreeStorageSpace',
            ComparisonOperator: 'LessThanThreshold',
            Threshold: 10737418240, // 10 GB
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'DBInstanceIdentifier',
                Value: opts.instance
            }]
        }
    };

    if (opts.dashboard) {
        Resources[`${opts.prefix}DBDashboard`] = {
            Type: 'AWS::CloudWatch::Dashboard',
            Properties: {
                DashboardName: cf.sub('${AWS::StackName}-${AWS::Region}-db'),
                DashboardBody: cf.sub(JSON.stringify(dashboard), {
                    Instance: opts.instance
                })
            }
        };
    }

    return { Resources };
}
