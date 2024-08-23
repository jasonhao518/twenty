import styled from '@emotion/styled';

import { AccountGroups } from '@/activities/accounts/components/AccountGroups';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const ObjectAccounts = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  return (
    <StyledContainer>
      <ObjectFilterDropdownScope filterScopeId="entity-accounts-filter-scope">
        <AccountGroups targetableObjects={[targetableObject]} showAddButton />
      </ObjectFilterDropdownScope>
    </StyledContainer>
  );
};
