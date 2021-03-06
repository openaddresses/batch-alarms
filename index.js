'use strict';

const cf = require('@mapbox/cloudfriend');
const dashboard = require('./lib/dashboard');

/**
 * Provide CloudFormation Based Metrics, Alarms, & Dashboards
 *
 * @param {Object} opts options object
 * @param {String} opts.prefix Cloudformation Prefix
 * @param {String} opts.email Email to submit alarms to
 * @param {String|Object} opts.cluster ARN or CF Ref/Att of ECS Cluster
 * @param {String|Object} opts.service ARN or CF Ref/Att of ECS Service
 * @param {String|Object} opts.targetgroup ARN or CF REf/Att of Target Group
 * @param {String|Object} opts.loadbalancer ARN or CF Ref/ATT of ELB
 *
 * @returns {Object} CloudFormation Fragment with alarm Resources
 */
function main(opts = {}) {
    if (!opts.prefix) opts.prefix = '';

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

    Resources[`${opts.prefix}MemoryAlarm`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'MemoryUtilization', cf.region]),
            Namespace: 'AWS/ECS',
            MetricName: 'MemoryUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
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
            AlarmName: cf.join('-', [cf.stackName, 'CPUUtilization', cf.region]),
            Namespace: 'AWS/ECS',
            MetricName: 'CPUUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'ClusterName',
                Value: opts.cluster
            },{
                Name: 'ServiceName',
                Value: opts.service
            }]
        }
    };

    Resources[`${opts.prefix}AlarmHTTPCodeELB5XX`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeELB5XX', cf.region]),
            MetricName: 'HTTPCode_ELB_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
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
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XX', cf.region]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
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
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XXDuration', cf.region]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60 * 5,
            EvaluationPeriods: 20 / 5,
            Threshold: 5,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
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
            AlarmName: cf.join('-', [cf.stackName, 'AlarmP99Latency', cf.region]),
            MetricName: 'TargetResponseTime',
            Namespace: 'AWS/ApplicationELB',
            ExtendedStatistic: 'p99',
            Period: '60',
            EvaluationPeriods: '5',
            Threshold: '10',
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}Dashboard`] = {
        Type: 'AWS::CloudWatch::Dashboard',
        Properties: {
            DashboardName: cf.sub('${AWS::StackName}-${AWS::Region}'),
            DashboardBody: cf.sub(JSON.stringify(dashboard), {
                LoadBalancerFullName: opts.loadbalancer,
                TargetGroupFullName: opts.targetgroup,
                ServiceName: opts.service,
                Cluster: opts.cluster
            })
        }
    }

    return { Resources };
}

module.exports = main;
