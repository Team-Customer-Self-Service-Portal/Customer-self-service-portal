import axios, { AxiosInstance } from 'axios';
import { Case } from '../../models';
import { logger } from '../../utils/logger';

interface SalesforceTokenResponse {
  access_token: string;
  instance_url: string;
}

class SalesforceService {
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private readonly loginUrl = 'https://login.salesforce.com/services/oauth2/token';

  private api(): AxiosInstance {
    return axios.create({
      baseURL: this.instanceUrl || process.env.SALESFORCE_INSTANCE_URL,
      headers: this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {},
    });
  }

  async authenticate(): Promise<void> {
    try {
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.SALESFORCE_CLIENT_ID || '',
        client_secret: process.env.SALESFORCE_CLIENT_SECRET || '',
        username: process.env.SALESFORCE_USERNAME || '',
        password: `${process.env.SALESFORCE_PASSWORD || ''}${process.env.SALESFORCE_SECURITY_TOKEN || ''}`,
      });
      const response = await axios.post<SalesforceTokenResponse>(this.loginUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;
    } catch (error) {
      logger.error('Salesforce authentication failed', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private async runWithRefresh<T>(cb: () => Promise<T>): Promise<T> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      return await cb();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.authenticate();
        return cb();
      }
      throw error;
    }
  }

  async createCase(data: Record<string, unknown>): Promise<string> {
    return this.runWithRefresh(async () => {
      const response = await this.api().post<{ id: string }>('/services/data/v58.0/sobjects/Case', data);
      return response.data.id;
    });
  }

  async updateCase(sfId: string, data: Record<string, unknown>): Promise<void> {
    await this.runWithRefresh(async () => {
      await this.api().patch(`/services/data/v58.0/sobjects/Case/${sfId}`, data);
    });
  }

  async getCase(sfId: string): Promise<Record<string, unknown>> {
    return this.runWithRefresh(async () => {
      const response = await this.api().get<Record<string, unknown>>(`/services/data/v58.0/sobjects/Case/${sfId}`);
      return response.data;
    });
  }

  async queryCases(contactId: string): Promise<Record<string, unknown>[]> {
    return this.runWithRefresh(async () => {
      const soql = `SELECT Id, CaseNumber, Subject, Description, Status, Priority, Type FROM Case WHERE ContactId='${contactId}'`;
      const response = await this.api().get<{ records: Record<string, unknown>[] }>('/services/data/v58.0/query', { params: { q: soql } });
      return response.data.records;
    });
  }

  async getKnowledgeArticles(query?: string, category?: string): Promise<Record<string, unknown>[]> {
    return this.runWithRefresh(async () => {
      const clauses: string[] = ["PublishStatus='Online'"];
      if (query) {
        clauses.push(`Title LIKE '%${query.replace(/'/g, "\\'")}%'`);
      }
      if (category) {
        clauses.push(`DataCategoryName='${category.replace(/'/g, "\\'")}'`);
      }
      const soql = `SELECT Id, Title, Summary, UrlName FROM Knowledge__kav WHERE ${clauses.join(' AND ')}`;
      const response = await this.api().get<{ records: Record<string, unknown>[] }>('/services/data/v58.0/query', { params: { q: soql } });
      return response.data.records;
    });
  }

  async getKnowledgeArticle(sfId: string): Promise<Record<string, unknown>> {
    return this.runWithRefresh(async () => {
      const response = await this.api().get<Record<string, unknown>>(`/services/data/v58.0/sobjects/Knowledge__kav/${sfId}`);
      return response.data;
    });
  }

  async syncCases(contactId: string): Promise<void> {
    const sfCases = await this.queryCases(contactId);
    await Promise.all(
      sfCases.map(async (sfCase) => {
        const salesforceCaseId = String(sfCase.Id || '');
        if (!salesforceCaseId) {
          return;
        }
        await Case.updateOne(
          { salesforceCaseId },
          {
            $set: {
              salesforceCaseNumber: sfCase.CaseNumber,
              subject: sfCase.Subject,
              description: sfCase.Description,
              status: sfCase.Status,
              priority: sfCase.Priority,
              category: sfCase.Type || 'General',
            },
          },
          { upsert: true }
        );
      })
    );
  }
}

export const salesforceService = new SalesforceService();
