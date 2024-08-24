import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStage,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

@Processor(MessageQueue.cronQueue)
export class MessagingMessageListFetchCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(MessagingMessageListFetchCronJob.name)
  async handle(): Promise<void> {
    console.time('MessagingMessageListFetchCronJob time');

    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const messageChannelRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
            activeWorkspace.id,
            'messageChannel',
          );

        const messageChannels = await messageChannelRepository.find({
          where: {
            isSyncEnabled: true,
            syncStage: In([
              MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
              MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            ]),
          },
        });

        for (const messageChannel of messageChannels) {
          await this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
            {
              workspaceId: activeWorkspace.id,
              messageChannelId: messageChannel.id,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          user: {
            workspaceId: activeWorkspace.id,
          },
        });
      }
    }

    console.timeEnd('MessagingMessageListFetchCronJob time');
  }
}
