export const fields = {
    client: {
        type: 'async',
        label: 'Client',
        entity: 'client',
        displayLabels: ['name'],
        outputValue: '_id',
        required: true,
    },
    date: {
        type: 'date',
        required: true,
    },
    amount: {
        type: 'currency',
        required: true,
    },
    status: {
        type: 'select',
        options: [
            { value: 'paid', label: 'paid', color: 'green' },
            { value: 'not_started', label: 'not_started', color: 'default' },
            { value: 'default', label: 'default', color: 'red' },
            { value: 'late', label: 'late', color: 'gold' },
            { value: 'partial', label: 'partial', color: 'orange' },
        ],
    },
    notes: {
        type: 'textarea',
    },
};
