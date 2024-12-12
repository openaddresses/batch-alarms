export default {
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
                    ['AWS/RDS', 'FreeStorageSpace', 'DBInstanceIdentifier', '${Instance}']
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
                    ['AWS/RDS', 'CPUUtilization', 'DBInstanceIdentifier', '${Instance}']
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
                    ['AWS/RDS', 'WriteLatency', 'DBInstanceIdentifier', '${Instance}'],
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
                    ['AWS/RDS', 'DatabaseConnections', 'DBInstanceIdentifier', '${Instance}']
                ],
                region: '${AWS::Region}'
            }
        }
    ]
};
