import { useCallback } from 'react';

import { Account } from '@/activities/types/Account';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useCompleteAccount = (task: Account) => {
  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Account>({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  const completeTask = useCallback(
    async (value: boolean) => {
      const status = value ? 'DONE' : 'TODO';
      await updateOneActivity?.({
        idToUpdate: task.id,
        updateOneRecordInput: {
          status,
        },
      });
    },
    [task.id, updateOneActivity],
  );

  return {
    completeTask,
  };
};
