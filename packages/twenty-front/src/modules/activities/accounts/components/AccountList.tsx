import styled from '@emotion/styled';
import { ReactElement } from 'react';

import { Account } from '@/activities/types/Account';
import { AccountRow } from './AccountRow';

type AccountListProps = {
  title?: string;
  accounts: Account[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTaskRows = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
`;

export const AccountList = ({ title, accounts, button }: AccountListProps) => (
  <>
    {accounts && accounts.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          {title && (
            <StyledTitle>
              {title} <StyledCount>{accounts.length}</StyledCount>
            </StyledTitle>
          )}
          {button}
        </StyledTitleBar>
        <StyledTaskRows>
          {accounts.map((account) => (
            <AccountRow key={account.id} task={account} />
          ))}
        </StyledTaskRows>
      </StyledContainer>
    )}
  </>
);
