import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TableName = 'Wines';

export interface IWine {
    id?: string;
    name: string;
    rating: number;
    comments: string;
    type: string;
    favorite?: boolean;
}

const Wine = {
    async find(): Promise<IWine[]> {
        const params = {
            TableName
        };
        const data = await dynamoDb.scan(params).promise();
        return data.Items as IWine[];
    },

    async findById(id: string): Promise<IWine | null> {
        const params = {
            TableName,
            Key: { id }
        };
        const data = await dynamoDb.get(params).promise();
        return data.Item as IWine | null;
    },

    async findOne(query: { name: string }): Promise<IWine | null> {
        const params = {
            TableName,
            FilterExpression: '#name = :name',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': query.name
            }
        };
        const data = await dynamoDb.scan(params).promise();
        return data.Items && data.Items.length > 0 ? (data.Items[0] as IWine) : null;
    },

    async save(wine: IWine): Promise<IWine> {
        wine.id = uuidv4();
        const params = {
            TableName,
            Item: wine
        };
        await dynamoDb.put(params).promise();
        return wine;
    },

    async update(id: string, updates: Partial<IWine>): Promise<IWine> {
        const params = {
            TableName,
            Key: { id },
            UpdateExpression: 'set #favorite = :favorite',
            ExpressionAttributeNames: {
                '#favorite': 'favorite'
            },
            ExpressionAttributeValues: {
                ':favorite': updates.favorite
            },
            ReturnValues: 'UPDATED_NEW'
        };
        const data = await dynamoDb.update(params).promise();
        return { id, ...updates, ...data.Attributes } as IWine;
    },

    async findFavorites(): Promise<IWine[]> {
        const params = {
            TableName,
            FilterExpression: 'favorite = :favorite',
            ExpressionAttributeValues: {
                ':favorite': true
            }
        };
        const data = await dynamoDb.scan(params).promise();
        return data.Items as IWine[];
    }
};

export default Wine;
