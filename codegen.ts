import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: {
        'https://api.start.gg/gql/alpha': {
            headers: {
                Authorization: `Bearer ${process.env.STARTGG_API_KEY}`,
            },
        },
    },
    generates: {
        'src/features/startggApi/startggApi.graphql.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
            ],
        },
    },
};

export default config;