import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarEventListFetchJob,
  CalendarEventsImportJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelVisibility,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import {
  ConnectedAccountProvider,
  ConnectedAccountWorkspaceEntity,
} from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class GoogleAPIsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly environmentService: EnvironmentService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  async refreshGoogleRefreshToken(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accessToken: string;
    refreshToken: string;
    calendarVisibility: CalendarChannelVisibility | undefined;
    messageVisibility: MessageChannelVisibility | undefined;
  }) {
    const {
      handle,
      workspaceId,
      workspaceMemberId,
      calendarVisibility,
      messageVisibility,
    } = input;

    const isCalendarEnabled = this.environmentService.get(
      'CALENDAR_PROVIDER_GOOGLE_ENABLED',
    );

    const connectedAccounts =
      await this.connectedAccountRepository.getAllByHandleAndWorkspaceMemberId(
        handle,
        workspaceMemberId,
        workspaceId,
      );

    const existingAccountId = connectedAccounts?.[0]?.id;
    const newOrExistingConnectedAccountId = existingAccountId ?? v4();

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspaceId);

    await workspaceDataSource.transaction(async (manager: EntityManager) => {
      if (!existingAccountId) {
        await this.connectedAccountRepository.create(
          {
            id: newOrExistingConnectedAccountId,
            handle,
            provider: ConnectedAccountProvider.GOOGLE,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            accountOwnerId: workspaceMemberId,
          },
          workspaceId,
          manager,
        );

        await messageChannelRepository.save(
          {
            id: v4(),
            connectedAccountId: newOrExistingConnectedAccountId,
            type: MessageChannelType.EMAIL,
            handle,
            visibility:
              messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
            syncStatus: MessageChannelSyncStatus.ONGOING,
          },
          {},
          manager,
        );

        if (isCalendarEnabled) {
          await calendarChannelRepository.save(
            {
              id: v4(),
              connectedAccountId: newOrExistingConnectedAccountId,
              handle,
              visibility:
                calendarVisibility ||
                CalendarChannelVisibility.SHARE_EVERYTHING,
            },
            {},
            manager,
          );
        }
      } else {
        await this.connectedAccountRepository.updateAccessTokenAndRefreshToken(
          input.accessToken,
          input.refreshToken,
          newOrExistingConnectedAccountId,
          workspaceId,
          manager,
        );

        const workspaceMemberRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );

        const workspaceMember = await workspaceMemberRepository.findOneOrFail({
          where: { id: workspaceMemberId },
        });

        const userId = workspaceMember.userId;

        await this.accountsToReconnectService.removeAccountToReconnect(
          userId,
          workspaceId,
          newOrExistingConnectedAccountId,
        );

        await messageChannelRepository.update(
          {
            connectedAccountId: newOrExistingConnectedAccountId,
          },
          {
            syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            syncStatus: null,
            syncCursor: '',
            syncStageStartedAt: null,
          },
          manager,
        );
      }
    });

    if (this.environmentService.get('MESSAGING_PROVIDER_GMAIL_ENABLED')) {
      const messageChannels = await messageChannelRepository.find({
        where: {
          connectedAccountId: newOrExistingConnectedAccountId,
        },
      });

      for (const messageChannel of messageChannels) {
        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            workspaceId,
            messageChannelId: messageChannel.id,
          },
        );
      }
    }

    if (isCalendarEnabled) {
      const calendarChannels = await calendarChannelRepository.find({
        where: {
          connectedAccountId: newOrExistingConnectedAccountId,
        },
      });

      for (const calendarChannel of calendarChannels) {
        await this.calendarQueueService.add<CalendarEventsImportJobData>(
          CalendarEventListFetchJob.name,
          {
            calendarChannelId: calendarChannel.id,
            workspaceId,
          },
        );
      }
    }
  }
}
