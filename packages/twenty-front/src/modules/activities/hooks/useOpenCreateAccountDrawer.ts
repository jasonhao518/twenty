import { useSetRecoilState } from 'recoil';

import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { Account } from '@/activities/types/Account';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateAccountDrawer = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular.Account;
}) => {
  const { openRightDrawer } = useRightDrawer();

  const setHotkeyScope = useSetHotkeyScope();

  const { createOneRecord: createOneActivity } = useCreateOneRecord<Account>({
    objectNameSingular: activityObjectNameSingular,
  });

  const { createOneRecord: createOneActivityTarget } =
    useCreateOneRecord<Account>({
      objectNameSingular: CoreObjectNameSingular.Account,
      shouldMatchRootQueryFilter: true,
    });

  const setActivityTargetableEntityArray = useSetRecoilState(
    activityTargetableEntityArrayState,
  );
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const setIsUpsertingActivityInDB = useSetRecoilState(
    isUpsertingActivityInDBState,
  );

  const openCreateActivityDrawer = async ({
    targetableObjects,
    customAssignee,
  }: {
    targetableObjects: ActivityTargetableObject[];
    customAssignee?: WorkspaceMember;
  }) => {
    const activity = await createOneActivity({
      assigneeId: customAssignee?.id,
    });

    const targetableObjectRelationIdName = `${targetableObjects[0].targetObjectNameSingular}Id`;

    await createOneActivityTarget({
      id: undefined,
      [targetableObjectRelationIdName]: targetableObjects[0].id,
    });

    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableRecordId(activity.id);
    setViewableRecordNameSingular(activityObjectNameSingular);
    setActivityTargetableEntityArray(targetableObjects ?? []);

    openRightDrawer(RightDrawerPages.ViewRecord);
    setIsUpsertingActivityInDB(false);
  };

  return openCreateActivityDrawer;
};
