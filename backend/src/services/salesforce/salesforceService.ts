import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';
import { cacheService, CacheKeys } from '../cache/cacheService';

interface SalesforceConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  apiVersion: string;
}

interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceCase {
  Id?: string;
  CaseNumber?: string;
  Subject: string;
  Description: string;
  Status: string;
  Priority: string;
  Origin: string;
  ContactId: string;
  AccountId?: string;
  Type?: string;
  Reason?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
  ClosedDate?: string;
  IsClosed?: boolean;
  Owner?: {
    Name: string;
    Email: string;
  };
}

interface SalesforceContact {
  Id?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  AccountId?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

interface SalesforceKnowledgeArticle {
  Id?: string;
  Title: string;
  Summary?: string;
  UrlName: string;
  ArticleNumber?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
  PublishStatus: string;
  Language: string;
  ArticleBody?: string;
  Categories?: string[];
}

export class SalesforceService {
  private axiosInstance: AxiosInstance;
  private config: SalesforceConfig;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor() {
    this.config = {
      instanceUrl: process.env.SALESFORCE_INSTANCE_URL || '',
      clientId: process.env.SALESFORCE_CLIENT_ID || '',
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
      username: process.env.SALESFORCE_USERNAME || '',
      password: process.env.SALESFORCE_PASSWORD || '',
      securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
      apiVersion: process.env.SALESFORCE_API_VERSION || 'v58.0',
    };

    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (!this.accessToken) {
          await this.authenticate();
        }
        
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        
        return config;
      },
      (error) => {
        logger.error('Salesforce request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          logger.warn('Salesforce token expired, refreshing...');
          
          this.accessToken = null;
          await cacheService.del('salesforce:auth_token');
          
          const originalRequest = error.config;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            await this.authenticate();
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.axiosInstance(originalRequest);
          }
        }
        
        logger.error('Salesforce API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        
        return Promise.reject(error);
      }
    );
  }

  public async authenticate(): Promise<void> {
    try {
      const cachedToken = await cacheService.get<string>('salesforce:auth_token');
      if (cachedToken) {
        this.accessToken = cachedToken;
        return;
      }

      logger.info('Authenticating with Salesforce...');

      const authUrl = `${this.config.instanceUrl}/services/oauth2/token`;
      const authData = new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: this.config.password + this.config.securityToken,
      });

      const response = await axios.post<SalesforceAuthResponse>(
        authUrl,
        authData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;

      await cacheService.set('salesforce:auth_token', this.accessToken, 3600);

      logger.info('✅ Salesforce authentication successful');
    } catch (error: any) {
      logger.error('Salesforce authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Salesforce');
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/limits`
      );
      return response.status === 200;
    } catch (error) {
      logger.error('Salesforce connection test failed:', error);
      return false;
    }
  }

  public async createCase(caseData: Partial<SalesforceCase>): Promise<SalesforceCase> {
    try {
      const response = await this.axiosInstance.post(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Case`,
        {
          Subject: caseData.Subject,
          Description: caseData.Description,
          Status: caseData.Status || 'New',
          Priority: caseData.Priority || 'Medium',
          Origin: caseData.Origin || 'Web',
          ContactId: caseData.ContactId,
          AccountId: caseData.AccountId,
          Type: caseData.Type,
          Reason: caseData.Reason,
        }
      );

      const createdCase = await this.getCaseById(response.data.id);
      
      if (caseData.ContactId) {
        await cacheService.delPattern(`sf:cases:contact:${caseData.ContactId}:*`);
      }

      logger.info(`✅ Created case ${createdCase.CaseNumber} in Salesforce`);
      return createdCase;
    } catch (error: any) {
      logger.error('Failed to create case in Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to create case in Salesforce');
    }
  }

  public async getCaseById(caseId: string): Promise<SalesforceCase> {
    try {
      const cacheKey = CacheKeys.salesforceSync('case', caseId);
      const cachedCase = await cacheService.get<SalesforceCase>(cacheKey);
      if (cachedCase) {
        return cachedCase;
      }

      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Case/${caseId}?fields=Id,CaseNumber,Subject,Description,Status,Priority,Origin,ContactId,AccountId,Type,Reason,CreatedDate,LastModifiedDate,ClosedDate,IsClosed,Owner.Name,Owner.Email`
      );

      const caseData = response.data;
      
      await cacheService.set(cacheKey, caseData, 300);

      return caseData;
    } catch (error: any) {
      logger.error('Failed to get case from Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to get case from Salesforce');
    }
  }

  public async getCasesByContactId(contactId: string, limit: number = 50): Promise<SalesforceCase[]> {
    try {
      const cacheKey = `sf:cases:contact:${contactId}:limit:${limit}`;
      const cachedCases = await cacheService.get<SalesforceCase[]>(cacheKey);
      if (cachedCases) {
        return cachedCases;
      }

      const soql = `SELECT Id,CaseNumber,Subject,Description,Status,Priority,Origin,ContactId,AccountId,Type,Reason,CreatedDate,LastModifiedDate,ClosedDate,IsClosed,Owner.Name,Owner.Email FROM Case WHERE ContactId = '${contactId}' ORDER BY CreatedDate DESC LIMIT ${limit}`;
      
      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/query?q=${encodeURIComponent(soql)}`
      );

      const cases = response.data.records;
      
      await cacheService.set(cacheKey, cases, 120);

      return cases;
    } catch (error: any) {
      logger.error('Failed to get cases from Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to get cases from Salesforce');
    }
  }

  public async updateCase(caseId: string, updateData: Partial<SalesforceCase>): Promise<SalesforceCase> {
    try {
      await this.axiosInstance.patch(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Case/${caseId}`,
        updateData
      );

      const cacheKey = CacheKeys.salesforceSync('case', caseId);
      await cacheService.del(cacheKey);

      const updatedCase = await this.getCaseById(caseId);
      
      logger.info(`✅ Updated case ${updatedCase.CaseNumber} in Salesforce`);
      return updatedCase;
    } catch (error: any) {
      logger.error('Failed to update case in Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to update case in Salesforce');
    }
  }

  public async upsertContact(contactData: Partial<SalesforceContact>): Promise<SalesforceContact> {
    try {
      let existingContact = null;
      if (contactData.Email) {
        existingContact = await this.getContactByEmail(contactData.Email);
      }

      if (existingContact) {
        await this.axiosInstance.patch(
          `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Contact/${existingContact.Id}`,
          {
            FirstName: contactData.FirstName,
            LastName: contactData.LastName,
            Phone: contactData.Phone,
          }
        );
        
        return await this.getContactById(existingContact.Id!);
      } else {
        const response = await this.axiosInstance.post(
          `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Contact`,
          contactData
        );

        const createdContact = await this.getContactById(response.data.id);
        logger.info(`✅ Created contact ${createdContact.Email} in Salesforce`);
        return createdContact;
      }
    } catch (error: any) {
      logger.error('Failed to upsert contact in Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to upsert contact in Salesforce');
    }
  }

  private async getContactByEmail(email: string): Promise<SalesforceContact | null> {
    try {
      const soql = `SELECT Id,FirstName,LastName,Email,Phone,AccountId,CreatedDate,LastModifiedDate FROM Contact WHERE Email = '${email}' LIMIT 1`;
      
      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/query?q=${encodeURIComponent(soql)}`
      );

      return response.data.records[0] || null;
    } catch (error) {
      return null;
    }
  }

  public async getContactById(contactId: string): Promise<SalesforceContact> {
    try {
      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/sobjects/Contact/${contactId}?fields=Id,FirstName,LastName,Email,Phone,AccountId,CreatedDate,LastModifiedDate`
      );

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get contact from Salesforce:', error.response?.data || error.message);
      throw new Error('Failed to get contact from Salesforce');
    }
  }

  public async getKnowledgeArticles(
    limit: number = 20,
    category?: string,
    searchTerm?: string
  ): Promise<SalesforceKnowledgeArticle[]> {
    try {
      const cacheKey = `sf:knowledge:list:${category || 'all'}:${searchTerm || 'all'}:${limit}`;
      const cachedArticles = await cacheService.get<SalesforceKnowledgeArticle[]>(cacheKey);
      if (cachedArticles) {
        return cachedArticles;
      }

      let soql = `SELECT Id,Title,Summary,UrlName,ArticleNumber,CreatedDate,LastModifiedDate,PublishStatus,Language FROM KnowledgeArticleVersion WHERE PublishStatus = 'Online' AND Language = 'en_US'`;
      
      if (category) {
        soql += ` AND ArticleType = '${category}'`;
      }
      
      if (searchTerm) {
        soql += ` AND (Title LIKE '%${searchTerm}%' OR Summary LIKE '%${searchTerm}%')`;
      }
      
      soql += ` ORDER BY LastModifiedDate DESC LIMIT ${limit}`;

      const response = await this.axiosInstance.get(
        `${this.instanceUrl}/services/data/v${this.config.apiVersion}/query?q=${encodeURIComponent(soql)}`
      );

      const articles = response.data.records;
      
      await cacheService.set(cacheKey, articles, 600);

      return articles;
    } catch (error: any) {
      logger.error('Failed to get knowledge articles from Salesforce:', error.response?.data || error.message);
      return [];
    }
  }
}

export const salesforceService = new SalesforceService();
