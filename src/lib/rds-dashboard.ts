/** Options shared by all RDS dashboard generator functions */
export interface RDSDashboardOpts {
    /** ARN or CF Ref/ATT of RDS Instance */
    instance?: string | object;
    /** ARN or CF Ref/ATT of RDS Cluster */
    cluster?: string | object;
}

/**
 * Builds the CloudWatch dashboard widget definition for an RDS instance or cluster.
 *
 * @remarks
 * Returns a raw dashboard body object intended to be serialised with `JSON.stringify`
 * and embedded in a `AWS::CloudWatch::Dashboard` resource via `cf.sub`.
 *
 * @param opts - Dashboard configuration options
 * @returns CloudWatch dashboard body with widget definitions
 */
export default function rdsDashboard(opts: RDSDashboardOpts): { widgets: object[] } {
    return {
        widgets: [
            {
                height: 6,
                width: 12,
                y: 0,
                x: 0,
                type: 'metric',
                properties: {
                    view: 'timeSeries',
                    stacked: false,
                    metrics: [
                        opts.instance
                            ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                            : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                    ],
                    region: '${AWS::Region}',
                    title: 'FreeStorageSpace',
                    period: 300,
                    yAxis: { left: { min: 0 } }
                }
            },
            {
                height: 6,
                width: 11,
                y: 0,
                x: 12,
                type: 'metric',
                properties: {
                    view: 'timeSeries',
                    stacked: false,
                    metrics: [
                        opts.instance
                            ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                            : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                    ],
                    region: '${AWS::Region}',
                    period: 300,
                    yAxis: { left: { min: 0, max: 100 } }
                }
            },
            {
                height: 6,
                width: 11,
                y: 6,
                x: 12,
                type: 'metric',
                properties: {
                    view: 'timeSeries',
                    stacked: false,
                    metrics: [
                        (
                            opts.instance
                                ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                                : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                        ),
                        ['.', 'ReadLatency', '.', '.']
                    ],
                    region: '${AWS::Region}'
                }
            },
            {
                height: 6,
                width: 12,
                y: 6,
                x: 0,
                type: 'metric',
                properties: {
                    view: 'timeSeries',
                    stacked: false,
                    metrics: [
                        opts.instance
                            ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                            : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                    ],
                    region: '${AWS::Region}'
                }
            }
        ]
    };
}
