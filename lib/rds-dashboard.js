/**
 * RDS Dashboard
 * @param {Object} opts - Options for the dashboard
 * @param {string} opts.instance - RDS Instance Identifier
 * @param {string} opts.instance - RDS Cluster Identifier
 */
export default function rdsDashboard(opts) {
    widgets: [
        {
            'height': 6,
            'width': 12,
            'y': 0,
            'x': 0,
            'type': 'metric',
            'properties': {
                'view': 'timeSeries',
                'stacked': false,
                'metrics': [
                    opts.instance
                        ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                        : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                ],
                region: '${AWS::Region}',
                'title': 'FreeStorageSpace',
                'period': 300,
                'yAxis': {
                    'left': {
                        'min': 0
                    }
                }
            }
        },
        {
            'height': 6,
            'width': 11,
            'y': 0,
            'x': 12,
            'type': 'metric',
            'properties': {
                'view': 'timeSeries',
                'stacked': false,
                'metrics': [
                    opts.instance
                        ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                        : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                ],
                region: '${AWS::Region}',
                'period': 300,
                'yAxis': {
                    'left': {
                        'min': 0,
                        'max': 100
                    }
                }
            }
        },
        {
            'height': 6,
            'width': 11,
            'y': 6,
            'x': 12,
            'type': 'metric',
            'properties': {
                'view': 'timeSeries',
                'stacked': false,
                'metrics': [
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
            'height': 6,
            'width': 12,
            'y': 6,
            'x': 0,
            'type': 'metric',
            'properties': {
                'view': 'timeSeries',
                'stacked': false,
                'metrics': [
                    opts.instance
                        ? ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
                        : ['AWS/RDS', 'FreeStorageSpace', 'DBClusterIdentifier', '${Cluster}']
                ],
                region: '${AWS::Region}'
            }
        }
    ]
};
