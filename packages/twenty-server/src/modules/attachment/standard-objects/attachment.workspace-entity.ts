import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AccountWorkspaceEntity } from 'src/modules/account/standard-objects/account.workspace-entity';
import { ActivityWorkspaceEntity } from 'src/modules/activity/standard-objects/activity.workspace-entity';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.attachment,
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
  description: 'An attachment',
  icon: 'IconFileImport',
  labelIdentifierStandardId: ATTACHMENT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Attachment name',
    icon: 'IconFileUpload',
  })
  name: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.fullPath,
    type: FieldMetadataType.TEXT,
    label: 'Full path',
    description: 'Attachment full path',
    icon: 'IconLink',
  })
  fullPath: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Attachment type',
    icon: 'IconList',
  })
  type: string;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.author,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Author',
    description: 'Attachment author',
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredAttachments',
  })
  author: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('author')
  authorId: string;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.activity,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Activity',
    description: 'Attachment activity',
    icon: 'IconNotes',
    inverseSideTarget: () => ActivityWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  activity: Relation<ActivityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('activity')
  activityId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.task,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Task',
    description: 'Attachment task',
    icon: 'IconNotes',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn('task')
  taskId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.note,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Note',
    description: 'Attachment note',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  note: Relation<NoteWorkspaceEntity> | null;

  @WorkspaceJoinColumn('note')
  noteId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.person,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Person',
    description: 'Attachment person',
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.company,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Company',
    description: 'Attachment company',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.opportunity,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Opportunity',
    description: 'Attachment opportunity',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('opportunity')
  opportunityId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.account,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Account',
    description: 'Attachment account',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  account: Relation<AccountWorkspaceEntity> | null;

  @WorkspaceJoinColumn('account')
  accountId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.agent,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Agent',
    description: 'Attachment agent',
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => AgentWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  agent: Relation<AgentWorkspaceEntity> | null;

  @WorkspaceJoinColumn('agent')
  agentId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.workflow,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow',
    description: 'Attachment workflow',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  @WorkspaceIsNullable()
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IsWorkflowEnabled,
  })
  workflow: Relation<WorkflowWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workflow')
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IsWorkflowEnabled,
  })
  workflowId: string | null;

  @WorkspaceDynamicRelation({
    type: RelationMetadataType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `Attachment ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
      icon: 'IconBuildingSkyscraper',
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
  })
  custom: Relation<CustomWorkspaceEntity>;
}
