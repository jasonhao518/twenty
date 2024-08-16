import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { ACCOUNT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.account,
  namePlural: 'accounts',
  labelSingular: 'Account',
  labelPlural: 'Accounts',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
  labelIdentifierStandardId: ACCOUNT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsNotAuditLogged()
export class AccountWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The opportunity name',
    icon: 'IconTargetArrow',
  })
  name: string;

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: 'Amount',
    description: 'Opportunity amount',
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

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

  @WorkspaceField({
    standardId: ACCOUNT_STANDARD_FIELD_IDS.probabilityDeprecated,
    type: FieldMetadataType.TEXT,
    label: 'Probability',
    description: 'Opportunity probability',
    icon: 'IconProgressCheck',
    defaultValue: "'0'",
  })
  @WorkspaceIsDeprecated()
  probability: string;
}
