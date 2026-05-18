export interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

export interface SalesforceCase {
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

export interface SalesforceContact {
  Id?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  AccountId?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

export interface SalesforceKnowledgeArticle {
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

export interface SalesforceError {
  message: string;
  errorCode: string;
  fields?: string[];
}
