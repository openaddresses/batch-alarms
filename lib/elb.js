import cf from '@openaddresses/cloudfriend';
import dashboard from './elb-dashboard.js';

/**
 * Provide CloudFormation Based Metrics, Alarms, & Dashboards ECS backed ELBs
 *
 * @param {Object} opts options object
 * @param {string}        opts.prefix Cloudformation Prefix
 * @param {string}        opts.email Email to submit alarms to
 * @param {string}        opts.topic Topic to submit alarms to
 * @param {string|Object} opts.apache Apache formatted log group
 * @param {string|Object} opts.cluster ARN or CF Ref/Att of ECS Cluster
 * @param {string|Object} opts.service ARN or CF Ref/Att of ECS Service
 * @param {string|Object} opts.targetgroup ARN or CF REf/Att of Target Group
 * @param {string|Object} opts.loadbalancer ARN or CF Ref/ATT of ELB
 * @param {Boolean}       [opts.dashboard=true] Is a dashboard created
 *
 * @returns {Object} CloudFormation Fragment with alarm Resources
 */
export default function ELB(opts = {}) {
    if (!opts.prefix) opts.prefix = '';
    if (!opts.dashboard) opts.dashboard = true;

    const Resources = {};

    if (opts.topic && opts.email) throw new Error('Topic & Email options cannot be used together');

    if (!opts.topic && opts.email) {
        Resources[`${opts.prefix}AlarmTopic`] = {
            Type: 'AWS::SNS::Topic',
            Properties: {
                TopicName: cf.join('-', [cf.stackName, 'topic', `${opts.prefix.toLowerCase()}`]),
                Subscription: [{
                    Endpoint: opts.email,
                    Protocol: 'email'
                }]
            }
        };

        opts.topic = cf.ref('`${opts.prefix}AlarmTopic`');
    }

    if (opts.cluster && opts.service) {
        Resources[`${opts.prefix}MemoryAlarm`] = {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
                AlarmName: cf.join('-', [cf.stackName, 'MemoryUtilization', cf.region, `${opts.prefix.toLowerCase()}`]),
                Namespace: 'AWS/ECS',
                MetricName: 'MemoryUtilization',
                ComparisonOperator: 'GreaterThanThreshold',
                Threshold: 80,
                EvaluationPeriods: 10,
                Statistic: 'Average',
                Period: 60,
                AlarmActions: opts.topic ? [opts.topic] : [],
                InsufficientDataActions: opts.topic ? [opts.topic] : [],
                Dimensions: [{
                    Name: 'ClusterName',
                    Value: opts.cluster
                }, {
                    Name: 'ServiceName',
                    Value: opts.service
                }]
            }
        };

        Resources[`${opts.prefix}CpuAlarm`] = {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
                AlarmName: cf.join('-', [cf.stackName, 'CPUUtilization', cf.region, `${opts.prefix.toLowerCase()}`]),
                Namespace: 'AWS/ECS',
                MetricName: 'CPUUtilization',
                ComparisonOperator: 'GreaterThanThreshold',
                Threshold: 80,
                EvaluationPeriods: 10,
                Statistic: 'Average',
                Period: 60,
                AlarmActions: opts.topic ? [opts.topic] : [],
                InsufficientDataActions: opts.topic ? [opts.topic] : [],
                Dimensions: [{
                    Name: 'ClusterName',
                    Value: opts.cluster
                },{
                    Name: 'ServiceName',
                    Value: opts.service
                }]
            }
        };
    }

    Resources[`${opts.prefix}AlarmHTTPCodeELB5XX`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeELB5XX', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_ELB_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmHTTPCodeBackend5XX`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XX', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmHTTPCodeBackend5XXDuration`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XXDuration', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60 * 5,
            EvaluationPeriods: 20 / 5,
            Threshold: 5,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmP99Latency`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmP99Latency', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'TargetResponseTime',
            Namespace: 'AWS/ApplicationELB',
            ExtendedStatistic: 'p99',
            Period: '60',
            EvaluationPeriods: '5',
            Threshold: '10',
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    if (opts.dashboard) {
        Resources[`${opts.prefix}Dashboard`] = {
            Type: 'AWS::CloudWatch::Dashboard',
            Properties: {
                DashboardName: cf.sub('${AWS::StackName}-${AWS::Region}-' + opts.prefix.toLowerCase()),
                DashboardBody: cf.sub(JSON.stringify(dashboard(opts)), {
                    LoadBalancerFullName: opts.loadbalancer,
                    TargetGroupFullName: opts.targetgroup,
                    Apache: opts.apache,
                    ServiceName: opts.service,
                    Cluster: opts.cluster
                })
            }
        };
    }

    return { Resources };
}
