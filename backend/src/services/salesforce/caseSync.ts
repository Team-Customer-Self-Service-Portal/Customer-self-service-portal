import cron from 'node-cron';
import Case from '../../models/Case';
import User from '../../models/User';
import { salesforceService } from './salesforceService';
import { logger } from '../../utils/logger';

class CaseSyncService {
  private isRunning: boolean = false;

  public startSync(): void {
    cron.schedule('*/15 * * * *', async () => {
      if (this.isRunning) {
        logger.info('Case sync already running, skipping...');
        return;
      }

      this.isRunning = true;
      await this.syncCases();
      this.isRunning = false;
    });

    logger.info('✅ Case sync scheduled to run every 15 minutes');
  }

  private async syncCases(): Promise<void> {
    try {
      logger.info('Starting case sync with Salesforce...');

      const casesToSync = await Case.find({
        salesforceId: { $exists: false },
        userId: { $exists: true }
      }).limit(50);

      logger.info(`Found ${casesToSync.length} cases to sync`);

      for (const caseDoc of casesToSync) {
        try {
          const user = await User.findById(caseDoc.userId);

          if (!user || !user.salesforceId) {
            logger.warn(`User ${caseDoc.userId} not found or no Salesforce ID`);
            continue;
          }

          const salesforceCase = await salesforceService.createCase({
            Subject: caseDoc.subject,
            Description: caseDoc.description,
            Status: caseDoc.status,
            Priority: caseDoc.priority,
            Origin: 'Web',
            ContactId: user.salesforceId,
            AccountId: user.accountId,
            Type: caseDoc.type,
          });

          caseDoc.salesforceId = salesforceCase.Id;
          caseDoc.lastSyncedAt = new Date();
          await caseDoc.save();

          logger.info(`Successfully synced case ${caseDoc.caseNumber}`, {
            caseId: caseDoc._id,
            salesforceId: salesforceCase.Id
          });

        } catch (error) {
          logger.error(`Failed to sync case ${caseDoc.caseNumber}:`, error);
        }
      }

      logger.info('Case sync completed');

    } catch (error) {
      logger.error('Case sync error:', error);
    }
  }

  public async syncSingleCase(caseId: string): Promise<void> {
    try {
      const caseDoc = await Case.findById(caseId).populate('userId');

      if (!caseDoc) {
        throw new Error('Case not found');
      }

      const user = caseDoc.userId as any;

      if (!user.salesforceId) {
        throw new Error('User has no Salesforce ID');
      }

      if (caseDoc.salesforceId) {
        await salesforceService.updateCase(caseDoc.salesforceId, {
          Subject: caseDoc.subject,
          Description: caseDoc.description,
          Status: caseDoc.status,
          Priority: caseDoc.priority,
        });
      } else {
        const salesforceCase = await salesforceService.createCase({
          Subject: caseDoc.subject,
          Description: caseDoc.description,
          Status: caseDoc.status,
          Priority: caseDoc.priority,
          Origin: 'Web',
          ContactId: user.salesforceId,
          AccountId: user.accountId,
          Type: caseDoc.type,
        });

        caseDoc.salesforceId = salesforceCase.Id;
      }

      caseDoc.lastSyncedAt = new Date();
      await caseDoc.save();

      logger.info(`Successfully synced case ${caseDoc.caseNumber}`);

    } catch (error) {
      logger.error(`Failed to sync case ${caseId}:`, error);
      throw error;
    }
  }
}

export const caseSyncService = new CaseSyncService();
