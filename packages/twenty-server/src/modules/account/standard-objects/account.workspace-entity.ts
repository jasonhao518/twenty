import { Relation } from 'typeorm';

import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ACCOUNT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export enum AgentGender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  UNKNOWN = 'UNKNOWN',
}

export enum Language {
  ENGLISH = 'ENGLISH',
  CHINESE = 'CHINESE',
  HINDI = 'HINDI',
  SPANISH = 'SPANISH',
  FRENCH = 'FRENCH',
  ARABIC = 'ARABIC',
  BENGALI = 'BENGALI',
  PORTUGUESE = 'PORTUGUESE',
  RUSSIAN = 'RUSSIAN',
  INDONESIAN = 'INDONESIAN',
  GERMAN = 'GERMAN',
  JAPANESE = 'JAPANESE',
  SWAHILI = 'SWAHILI',
  MARATHI = 'MARATHI',
  TELUGU = 'TELUGU',
  TURKISH = 'TURKISH',
  TAMIL = 'TAMIL',
  VIETNAMESE = 'VIETNAMESE',
  KOREAN = 'KOREAN',
  ITALIAN = 'ITALIAN',
  THAI = 'THAI',
  POLISH = 'POLISH',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.account,
  namePlural: 'accounts',
  labelSingular: 'Account',
  labelPlural: 'Accounts',
  description: 'An account',
  icon: 'IconTargetArrow',
  labelIdentifierStandardId: ACCOUNT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class AccountWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'The opportunity name',
    icon: 'IconTargetArrow',
  })
  name: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.country,
    type: FieldMetadataType.TEXT,
    label: 'country',
    description: 'Contact’s country',
    icon: 'IconMap',
  })
  country: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.city,
    type: FieldMetadataType.TEXT,
    label: 'City',
    description: 'Contact’s city',
    icon: 'IconMap',
  })
  city: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.gender,
    type: FieldMetadataType.SELECT,
    label: 'Gender',
    description:
      'Automatically create records for people you participated with in an event.',
    icon: 'IconUserCircle',
    options: [
      {
        value: AgentGender.MALE,
        label: 'Male',
        color: 'green',
        position: 0,
      },
      {
        value: AgentGender.FEMALE,
        label: 'Female',
        color: 'orange',
        position: 1,
      },
      {
        value: AgentGender.UNKNOWN,
        label: 'Unknown',
        color: 'blue',
        position: 2,
      },
    ],
    defaultValue: `'${AgentGender.UNKNOWN}'`,
  })
  gender: AgentGender;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.language,
    type: FieldMetadataType.SELECT,
    label: 'Language',
    description: 'agent language',
    icon: 'IconUserCircle',
    options: [
      {
        value: Language.ENGLISH,
        label: 'English',
        color: 'green',
        position: 0,
      },
      {
        value: Language.CHINESE,
        label: 'Chinese',
        color: 'orange',
        position: 1,
      },
      {
        value: Language.JAPANESE,
        label: 'Japanese',
        color: 'blue',
        position: 2,
      },
    ],
    defaultValue: `'${Language.ENGLISH}'`,
  })
  language: Language;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.birthday,
    type: FieldMetadataType.DATE,
    label: 'Birthday',
    description: 'Opportunity birthday',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  birthday: Date | null;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.url,
    type: FieldMetadataType.LINK,
    label: 'Url',
    description: 'Url',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  url: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.closeDate,
    type: FieldMetadataType.DATE_TIME,
    label: 'Close date',
    description: 'Opportunity close date',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  closeDate: Date | null;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.stage,
    type: FieldMetadataType.SELECT,
    label: 'Stage',
    description: 'Opportunity stage',
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'New', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'Screening', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'Meeting', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'Proposal',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'Customer', position: 4, color: 'yellow' },
    ],
    defaultValue: "'NEW'",
  })
  @WorkspaceIndex()
  stage: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Opportunity record position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Created by',
    icon: 'IconCreativeCommonsSa',
    description: 'The creator of the record',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.activityTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Activities',
    description: 'Activities tied to the opportunity',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Tasks',
    description: 'Tasks tied to the opportunity',
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Notes',
    description: 'Notes tied to the opportunity',
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the opportunity',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Timeline Activities',
    description: 'Timeline Activities linked to the opportunity.',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAIL,
    label: 'Email',
    description: 'Email',
    icon: 'IconProgressCheck',
  })
  @WorkspaceIsNullable()
  email: string;
}
