import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntitySchema, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { workspaceDataSourceCacheInstance } from 'src/engine/twenty-orm/twenty-orm-core.module';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceDatasourceFactory {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
  ) {}

  public async create(
    workspaceId: string,
    workspaceMetadataVersion: string | null,
  ): Promise<WorkspaceDataSource> {
    const logId = v4();

    console.time(`fetch in datasource factory ${logId}`);

    const latestWorkspaceMetadataVersion =
      await this.workspaceMetadataVersionService.getMetadataVersion(
        workspaceId,
      );

    console.timeEnd(`fetch in datasource factory ${logId}`);

    const desiredWorkspaceMetadataVersion =
      workspaceMetadataVersion ?? latestWorkspaceMetadataVersion;

    if (!desiredWorkspaceMetadataVersion) {
      throw new Error(
        `Desired workspace metadata version not found while creating workspace data source for workspace ${workspaceId}`,
      );
    }

    if (latestWorkspaceMetadataVersion !== desiredWorkspaceMetadataVersion) {
      throw new Error(
        `Workspace metadata version mismatch detected for workspace ${workspaceId}. Current version: ${latestWorkspaceMetadataVersion}. Desired version: ${desiredWorkspaceMetadataVersion}`,
      );
    }

    let cachedObjectMetadataCollection =
      await this.workspaceCacheStorageService.getObjectMetadataCollection(
        workspaceId,
      );

    if (!cachedObjectMetadataCollection) {
      const freshObjectMetadataCollection =
        await this.objectMetadataRepository.find({
          where: { workspaceId },
          relations: [
            'fields.object',
            'fields',
            'fields.fromRelationMetadata',
            'fields.toRelationMetadata',
            'fields.fromRelationMetadata.toObjectMetadata',
          ],
        });

      await this.workspaceCacheStorageService.setObjectMetadataCollection(
        workspaceId,
        freshObjectMetadataCollection,
      );

      cachedObjectMetadataCollection = freshObjectMetadataCollection;
    }

    const workspaceDataSource = await workspaceDataSourceCacheInstance.execute(
      `${workspaceId}-${latestWorkspaceMetadataVersion}`,
      async () => {
        const logId = v4();

        console.log('Creating workspace fresh data source...' + logId);
        const dataSourceMetadata =
          await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
            workspaceId,
          );

        if (!dataSourceMetadata) {
          throw new Error(
            `Data source metadata not found for workspace ${workspaceId}`,
          );
        }

        if (!cachedObjectMetadataCollection) {
          throw new Error(
            `Object metadata collection not found for workspace ${workspaceId}`,
          );
        }

        console.time('create entity schema' + logId);
        const cachedEntitySchemaOptions =
          await this.workspaceCacheStorageService.getORMEntitySchema(
            workspaceId,
          );

        let cachedEntitySchemas: EntitySchema[];

        if (cachedEntitySchemaOptions) {
          cachedEntitySchemas = cachedEntitySchemaOptions.map(
            (option) => new EntitySchema(option),
          );
        } else {
          const entitySchemas = await Promise.all(
            cachedObjectMetadataCollection.map((objectMetadata) =>
              this.entitySchemaFactory.create(workspaceId, objectMetadata),
            ),
          );

          await this.workspaceCacheStorageService.setORMEntitySchema(
            workspaceId,
            entitySchemas.map((entitySchema) => entitySchema.options),
          );

          cachedEntitySchemas = entitySchemas;
        }
        console.timeEnd('create entity schema' + logId);

        console.time('create workspace data source' + logId);
        const workspaceDataSource = new WorkspaceDataSource(
          {
            workspaceId,
            objectMetadataCollection: cachedObjectMetadataCollection,
          },
          {
            url:
              dataSourceMetadata.url ??
              this.environmentService.get('PG_DATABASE_URL'),
            type: 'postgres',
            logging: this.environmentService.get('DEBUG_MODE')
              ? ['query', 'error']
              : ['error'],
            schema: dataSourceMetadata.schema,
            entities: cachedEntitySchemas,
            ssl: this.environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
              ? {
                  rejectUnauthorized: false,
                }
              : undefined,
          },
        );

        console.timeEnd('create workspace data source' + logId);

        console.time('initialize workspace data source' + logId);
        await workspaceDataSource.initialize();
        console.timeEnd('initialize workspace data source' + logId);

        return workspaceDataSource;
      },
      (dataSource) => dataSource.destroy(),
    );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    return workspaceDataSource;
  }
}
