import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

import { AddAccountButton } from '@/activities/accounts/components/AddAccountButton';
import { ACCOUNTS_TAB_LIST_COMPONENT_ID } from '@/activities/accounts/constants/AccountsTabListComponentId';
import { useAccounts } from '@/activities/accounts/hooks/useAccounts';
import { useOpenCreateAccountDrawer } from '@/activities/hooks/useOpenCreateAccountDrawer';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AccountList } from './AccountList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type AccountGroupsProps = {
  filterDropdownId?: string;
  targetableObjects?: ActivityTargetableObject[];
  showAddButton?: boolean;
};

export const AccountGroups = ({
  targetableObjects,
  showAddButton,
}: AccountGroupsProps) => {
  const { accounts, accountsLoading } = useAccounts({
    targetableObjects: targetableObjects ?? [],
  });

  const openCreateActivity = useOpenCreateAccountDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Account,
  });

  const { activeTabIdState } = useTabList(ACCOUNTS_TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  const isLoading =
    (activeTabId !== 'done' && accountsLoading) ||
    (activeTabId === 'done' && accountsLoading);

  const isTasksEmpty =
    (activeTabId !== 'done' && accounts?.length === 0) ||
    (activeTabId === 'done' && accounts?.length === 0);

  if (isLoading && isTasksEmpty) {
    return <SkeletonLoader />;
  }

  if (isTasksEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noTask" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No account associated!
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            Try to add some account. Play with social media.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title="New account"
          variant={'secondary'}
          onClick={() =>
            openCreateActivity({
              targetableObjects: targetableObjects ?? [],
            })
          }
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledContainer>
      <AccountList
        title={'count'}
        accounts={accounts}
        button={
          showAddButton && (
            <AddAccountButton activityTargetableObjects={targetableObjects} />
          )
        }
      />
    </StyledContainer>
  );
};
