import { Account } from '@/activities/types/Account';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
type UseAccountsProps = {
  targetableObjects: ActivityTargetableObject[];
};

export const useAccounts = ({ targetableObjects }: UseAccountsProps) => {
  const { records: accounts, loading } = useFindManyRecords<Account>({
    objectNameSingular: CoreObjectNameSingular.Account,

    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
  });

  return {
    accounts: (accounts ?? []) as Account[],
    accountsLoading: loading,
  };
};
