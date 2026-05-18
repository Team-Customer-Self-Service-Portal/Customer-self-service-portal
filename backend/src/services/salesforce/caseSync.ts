import cron from 'node-cron';
import { User } from '../../models';
import { logger } from '../../utils/logger';
import { salesforceService } from './salesforceService';

export const syncAllCases = (): void => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const users = await User.find({ salesforceContactId: { $exists: true, $ne: null } }).select('salesforceContactId');
      await Promise.all(
        users.map(async (user) => {
          if (!user.salesforceContactId) {
            return;
          }
          try {
            await salesforceService.syncCases(user.salesforceContactId);
          } catch (error) {
            logger.warn('Case sync failed for user', { userId: user._id, error: error instanceof Error ? error.message : String(error) });
          }
        })
      );
    } catch (error) {
      logger.error('Background case sync failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
};
