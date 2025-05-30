/**
 * Fabric REST API Response
 */
export interface IEventhouse {
  id?: string | null | undefined;
  displayName?: string;
  description?: string;
  type?: string;
  workspaceId?: string;
  properties?: IEventhouseProperties;

  error?: string;
};

interface IEventhouseProperties {
  queryServiceUri?: string;
  ingestionServiceUri?: string;
  databasesItemIds?: string[];
};

/**
 * Fabric REST API Response
 */
export interface IKQLDatabase {
  /** Database GUID */
  id?: string | null | undefined;
  /** Database name */
  displayName?: string;
  /** Database description */
  description?: string;
  /**  */
  type?: string;
  /** Parent Workspace GUID */
  workspaceId?: string;
  /** Database properties */
  properties?: IKQLDatabaseProperties;
  error?: string;
};

interface IKQLDatabaseProperties {
  /** Parent Eventhouse GUID */
  parentEventhouseItemId?: string;
  /** Eventhouse Query URI */
  queryServiceUri?: string;
  /** Eventhouse Ingestion URI */
  ingestionServiceUri?: string;
  databaseType?: string;
};