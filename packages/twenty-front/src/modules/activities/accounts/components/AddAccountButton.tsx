import { isNonEmptyArray } from '@sniptt/guards';
import { IconPlus } from 'twenty-ui';

import { useOpenCreateAccountDrawer } from '@/activities/hooks/useOpenCreateAccountDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Button } from '@/ui/input/button/components/Button';

export const AddAccountButton = ({
  activityTargetableObjects,
}: {
  activityTargetableObjects?: ActivityTargetableObject[];
}) => {
  const openCreateActivity = useOpenCreateAccountDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Account,
  });

  if (!isNonEmptyArray(activityTargetableObjects)) {
    return <></>;
  }

  return (
    <Button
      Icon={IconPlus}
      size="small"
      variant="secondary"
      title="Add Account"
      onClick={() =>
        openCreateActivity({
          targetableObjects: activityTargetableObjects,
        })
      }
    ></Button>
  );
};
