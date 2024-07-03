import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TableName = 'History';

export interface IHistory {
    id?: string;
    imageUrl: string;
    wineName: string;
    uploadDate?: string;
}

const History = {
    async find(): Promise<IHistory[]> {
        const params = {
            TableName,
            ScanIndexForward: false // Sort by uploadDate descending
        };
        const data = await dynamoDb.scan(params).promise();
        return data.Items as IHistory[];
    },

    async findById(id: string): Promise<IHistory | null> {
        const params = {
            TableName,
            Key: { id }
        };
        const data = await dynamoDb.get(params).promise();
        return data.Item as IHistory | null;
    },

    async save(entry: IHistory): Promise<IHistory> {
        entry.id = uuidv4();
        entry.uploadDate = new Date().toISOString();
        const params = {
            TableName,
            Item: entry
        };
        await dynamoDb.put(params).promise();
        return entry;
    },

    async deleteById(id: string): Promise<void> {
        const params = {
            TableName,
            Key: { id }
        };
        await dynamoDb.delete(params).promise();
    }
};

export default History;
